/**
 * HTTP API over the Steward agent (Hono — testable via app.request, no real
 * server needed). Reasoner/executor/policy are injected so it runs live
 * (Venice + DelegatedExecutor) or in demos/tests (fakes + DryRunExecutor).
 * Optional `contextProvider` (on-chain reads via Venice) and `statusChecker`
 * (relayer status) light up the live demo without touching the test wiring.
 */
import { Hono } from "hono";

import { Steward, type Executor } from "./agent/planner.js";
import type { Policy } from "./agent/policy.js";
import type { RunState } from "./agent/types.js";
import { APP_HTML } from "./ui/app.js";
import { GRANT_HTML } from "./ui/grant.js";
import { LANDING_HTML } from "./ui/landing.js";
import type { Reasoner } from "./venice.js";
import { randomUUID } from "node:crypto";
import { runCity } from "./city/orchestrator.js";
import type { CityBase } from "./city/live.js";
import type { CityRun } from "./city/types.js";
import { WebhookInbox } from "./city/webhookInbox.js";
import { parseGrant, type ParsedGrant } from "./delegation/grantBridge.js";
import { RelayerWebhookVerifier } from "./webhook.js";

export interface DemoInfo {
  mode: "live" | "dry-run";
  network: string;
  treasury?: string;
  payee?: string;
  explorerTxBase?: string;
}

export interface ApiDeps {
  reasoner: Reasoner;
  executor: Executor;
  policy: Policy;
  /** Live on-chain context (read via Venice Crypto-RPC), prepended to each goal. */
  contextProvider?: () => Promise<string>;
  /** Resolve a relayer task to its on-chain status (the UI polls this). */
  statusChecker?: (
    taskId: string,
  ) => Promise<{ status: number; hash?: string }>;
  /** Static demo banner info. */
  info?: DemoInfo;
  /** Builds live city deps (principal, relayer, caps); omitted in dry-run/tests. */
  cityFactory?: () => Promise<CityBase>;
}

function serialize(state: RunState) {
  return {
    id: state.id,
    goal: state.goal,
    status: state.status,
    result: state.result,
    error: state.error,
    spentToday: state.spentToday,
    pending: state.pending,
    audit: state.audit,
  };
}

function lastTaskId(state: RunState): string | undefined {
  for (let i = state.audit.length - 1; i >= 0; i -= 1) {
    const e = state.audit[i];
    if (e && e.kind === "executed") {
      const id = (e.data as { taskId?: unknown }).taskId;
      if (typeof id === "string") return id;
    }
  }
  return undefined;
}

export function createApi(deps: ApiDeps): Hono {
  const runs = new Map<string, RunState>();
  const steward = new Steward(deps.reasoner, deps.policy, deps.executor);
  let revoked = false;
  // Verified 1Shot webhook receiver: signature-checked status events feed a PUSH-first inbox.
  const webhookInbox = new WebhookInbox();
  const webhookVerifier = new RelayerWebhookVerifier();
  const app = new Hono();

  app.get("/", (c) => c.html(LANDING_HTML));
  app.get("/app", (c) => c.html(APP_HTML));
  app.get("/healthz", (c) => c.json({ ok: true }));
  app.get("/info", (c) =>
    c.json(deps.info ?? { mode: "dry-run", network: "none" }),
  );

  // 1Shot relayer webhook receiver — verify the Ed25519/JWKS signature, then cache the
  // status PUSH-first for the orchestrator (settle() reads it before polling). The
  // 1Shot track rewards sourcing status from signed webhooks.
  app.post("/webhooks/1shot", async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return c.json({ ok: false, error: "invalid body" }, 400);
    }
    const valid = await webhookVerifier
      .verify(body as Record<string, unknown>)
      .catch(() => false);
    if (!valid) return c.json({ ok: false, error: "invalid signature" }, 401);
    const { data } = body as {
      data?: { id?: unknown; status?: unknown; hash?: unknown };
    };
    if (data && typeof data.id === "string" && typeof data.status === "number") {
      webhookInbox.record(
        data.id,
        data.status,
        typeof data.hash === "string" ? data.hash : undefined,
      );
    }
    return c.json({ ok: true });
  });
  app.get("/webhooks", (c) => c.json(webhookInbox.stats()));

  app.get("/policy", (c) =>
    c.json({
      token: deps.policy.token,
      maxPerTx: deps.policy.maxPerTx.toString(),
      maxPerDay: deps.policy.maxPerDay.toString(),
      allowedTargets: [...deps.policy.allowedTargets],
      revoked,
    }),
  );

  app.post("/revoke", (c) => {
    revoked = true;
    return c.json({ revoked });
  });

  app.post("/runs", async (c) => {
    if (revoked) return c.json({ error: "authority has been revoked" }, 403);
    const body = (await c.req.json().catch(() => ({}))) as { goal?: unknown };
    if (typeof body.goal !== "string" || body.goal.length === 0) {
      return c.json({ error: "a non-empty 'goal' string is required" }, 400);
    }
    let goal = body.goal;
    if (deps.contextProvider) {
      try {
        goal = `${await deps.contextProvider()}\n\n${goal}`;
      } catch {
        // fall back to the raw goal if the on-chain read fails
      }
    }
    const state = await steward.resume(steward.start(goal));
    runs.set(state.id, state);
    return c.json(serialize(state));
  });

  app.get("/runs/:id", (c) => {
    const state = runs.get(c.req.param("id"));
    if (!state) return c.json({ error: "run not found" }, 404);
    return c.json(serialize(state));
  });

  app.get("/runs/:id/status", async (c) => {
    const state = runs.get(c.req.param("id"));
    if (!state) return c.json({ error: "run not found" }, 404);
    const taskId = lastTaskId(state);
    if (!taskId || taskId === "dry-run") {
      return c.json({ taskId: taskId ?? null, status: null });
    }
    if (!deps.statusChecker) return c.json({ taskId, status: null });
    try {
      const s = await deps.statusChecker(taskId);
      return c.json({ taskId, status: s.status, hash: s.hash ?? null });
    } catch (err) {
      return c.json({ taskId, status: null, error: (err as Error).message });
    }
  });

  app.post("/runs/:id/approve", async (c) => {
    const state = runs.get(c.req.param("id"));
    if (!state) return c.json({ error: "run not found" }, 404);
    if (state.status !== "awaiting_approval") {
      return c.json({ error: "run is not awaiting approval" }, 409);
    }
    const body = (await c.req.json().catch(() => ({}))) as {
      approved?: unknown;
      note?: unknown;
    };
    const next = await steward.approve(
      state,
      Boolean(body.approved),
      String(body.note ?? ""),
    );
    runs.set(next.id, next);
    return c.json(serialize(next));
  });

  const cityRuns = new Map<string, CityRun>();
  let cityBasePromise: Promise<CityBase> | null = null;
  /** The validated browser ERC-7715 grant; city runs chain under it when set. */
  let activeGrant: ParsedGrant | null = null;

  app.post("/city/run", async (c) => {
    if (revoked) return c.json({ error: "authority has been revoked" }, 403);
    const factory = deps.cityFactory;
    if (!factory)
      return c.json({ error: "live mode required for the city demo" }, 503);
    const body = (await c.req.json().catch(() => ({}))) as { goal?: unknown };
    const goal =
      typeof body.goal === "string" && body.goal
        ? body.goal
        : "Produce a market brief on ETH";
    let base: CityBase;
    try {
      cityBasePromise ??= factory();
      base = await cityBasePromise;
    } catch (err) {
      cityBasePromise = null;
      return c.json({ error: (err as Error).message }, 503);
    }
    // Snapshot: a concurrent re-grant must not affect a run already dispatched.
    const grant = activeGrant;
    const run: CityRun = {
      id: randomUUID(),
      goal,
      status: "queued",
      ledger: [],
      network: base.network,
      explorerTxBase: base.explorerTxBase,
      authorityRoot: grant ? "grant" : "treasury",
      grantDelegator: grant?.delegator,
    };
    cityRuns.set(run.id, run);
    void runCity(
      {
        ...base.deps,
        grantChain: grant?.chain,
        webhookInbox,
        onUpdate: () => undefined,
        isRevoked: () => revoked,
      },
      run,
      base.makeSpecs(goal),
    ).catch((err) => {
      run.status = "failed";
      run.result = (err as Error).message;
    });
    return c.json({ id: run.id });
  });

  app.get("/city/run/:id", (c) => {
    const run = cityRuns.get(c.req.param("id"));
    if (!run) return c.json({ error: "run not found" }, 404);
    return c.json(run);
  });

  app.get("/grant", (c) => c.html(GRANT_HTML));
  app.get("/city/config", async (c) => {
    const factory = deps.cityFactory;
    if (!factory)
      return c.json({ error: "live mode required for the city" }, 503);
    try {
      cityBasePromise ??= factory();
      const base = await cityBasePromise;
      return c.json({
        chainId: base.deps.chainId,
        usdc: base.deps.token,
        agent: base.deps.principal.account.address,
        network: base.network,
      });
    } catch (err) {
      cityBasePromise = null;
      return c.json({ error: (err as Error).message }, 503);
    }
  });
  // ERC-7715 Advanced Permissions front door: the /grant page POSTs MetaMask's
  // response here. It is validated + decoded at this boundary; once accepted,
  // every subsequent /city/run chains the workers' budgets under the grant.
  app.post("/city/grant", async (c) => {
    const body = await c.req.json().catch(() => null);
    if (body === null) {
      // Malformed JSON must not clear a previously accepted grant.
      return c.json({ ok: false, error: "invalid JSON body" }, 400);
    }
    const factory = deps.cityFactory;
    if (!factory)
      return c.json({ ok: false, error: "live mode required for grants" }, 503);
    try {
      cityBasePromise ??= factory();
      const base = await cityBasePromise;
      activeGrant = parseGrant(body, base.deps.principal.account.address);
      return c.json({
        ok: true,
        delegator: activeGrant.delegator,
        links: activeGrant.chain.length,
      });
    } catch (err) {
      activeGrant = null;
      return c.json({ ok: false, error: (err as Error).message }, 400);
    }
  });
  // Summary only — never echo browser-supplied JSON back out.
  app.get("/city/grant", (c) =>
    c.json(
      activeGrant
        ? {
            active: true,
            delegator: activeGrant.delegator,
            links: activeGrant.chain.length,
          }
        : { active: false },
    ),
  );

  return app;
}

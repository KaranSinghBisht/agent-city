import { describe, expect, it } from "vitest";

import { DryRunExecutor } from "./agent/dryRunExecutor.js";
import type { Policy } from "./agent/policy.js";
import { createApi } from "./api.js";
import type { ChatMessage, Reasoner } from "./venice.js";

class FakeReasoner implements Reasoner {
  private index = 0;
  constructor(private readonly scripted: string[]) {}
  async complete(_messages: ChatMessage[]): Promise<string> {
    return this.scripted[this.index++] ?? '{"action":"final","output":"done"}';
  }
}

const policy: Policy = {
  token: "0xusdc",
  maxPerTx: 100n,
  maxPerDay: 250n,
  allowedTargets: new Set(["0xmerchant"]),
};

const PROPOSE = JSON.stringify({
  action: "propose",
  proposal: { kind: "transfer", to: "0xmerchant", token: "0xusdc", amount: "50", reason: "pay" },
});

function api(script: string[]) {
  return createApi({ reasoner: new FakeReasoner(script), executor: new DryRunExecutor(), policy });
}

function post(app: ReturnType<typeof api>, path: string, body: unknown) {
  return app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Steward API", () => {
  it("serves the demo UI at /", async () => {
    const res = await api([]).request("/");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Steward");
  });

  it("reports healthy", async () => {
    expect((await api([]).request("/healthz")).status).toBe(200);
  });

  it("exposes the budget policy (bigints serialized)", async () => {
    const body = (await (await api([]).request("/policy")).json()) as { maxPerTx: string; revoked: boolean };
    expect(body.maxPerTx).toBe("100");
    expect(body.revoked).toBe(false);
  });

  it("starts a run that pauses for approval, then completes on approve", async () => {
    const app = api([PROPOSE, JSON.stringify({ action: "final", output: "Paid." })]);

    const created = await post(app, "/runs", { goal: "pay the invoice" });
    expect(created.status).toBe(200);
    const body = (await created.json()) as { id: string; status: string };
    expect(body.status).toBe("awaiting_approval");

    const approved = await post(app, `/runs/${body.id}/approve`, { approved: true });
    expect(((await approved.json()) as { status: string }).status).toBe("done");
  });

  it("blocks new runs after revoke", async () => {
    const app = api([PROPOSE]);
    await post(app, "/revoke", {});
    expect((await post(app, "/runs", { goal: "spend" })).status).toBe(403);
  });

  it("404s an unknown run", async () => {
    expect((await api([]).request("/runs/missing")).status).toBe(404);
  });

  it("400s a missing goal", async () => {
    expect((await post(api([]), "/runs", {})).status).toBe(400);
  });
});

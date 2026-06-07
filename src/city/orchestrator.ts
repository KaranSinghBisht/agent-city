/**
 * Agent City orchestrator. A Manager hires worker agents; each worker gets a
 * capped sub-budget via A2A redelegation (principal → worker → relayer), then
 * BUYS from a real x402 service: GET → HTTP 402 → pay the price as an ERC-7710
 * redemption through 1Shot → receive the resource. Every settlement is an
 * on-chain receipt (the City Ledger) and builds the worker's reputation, which
 * sizes its next budget.
 *
 * The relayer allows ONE 7702 authorization per request, so workers run one at a
 * time: a fresh worker spends its single auth slot upgrading itself; an already-
 * upgraded worker needs none. The principal (root delegator) funds the spend.
 */
import type { Executor } from "../agent/planner.js";
import type { ExecutionResult, ProposedAction } from "../agent/types.js";
import { buildBudgetDelegation } from "../delegation/delegation.js";
import { DelegatedExecutor, staticResolver } from "../delegation/executor.js";
import {
  toPermissionContext,
  type SignedDelegation,
} from "../delegation/redeem.js";
import { buildRedelegation } from "../delegation/redelegate.js";
import {
  buildUpgradeAuthorization,
  createSmartAccountFromKey,
  isUpgraded,
} from "../delegation/smartAccount.js";
import type { OneShotRelayer } from "../relayer.js";
import { X402Client } from "../x402/client.js";
import { DelegatedPayer } from "../x402/payer.js";
import { credit, recordReceipt } from "./reputation.js";
import type { CityDeps, CityRun, LedgerEntry, WorkerSpec } from "./types.js";

type SmartAccount = Awaited<ReturnType<typeof createSmartAccountFromKey>>;

const shrink = (a: string): string =>
  a ? a.slice(0, 6) + "…" + a.slice(-4) : "";

/** Wrap an Executor to capture the taskId of the redemption it submits. */
function recordingExecutor(
  inner: Executor,
  sink: { taskId?: string },
): Executor {
  return {
    execute: async (action: ProposedAction): Promise<ExecutionResult> => {
      const result = await inner.execute(action);
      if (result.ok && result.taskId) sink.taskId = result.taskId;
      return result;
    },
  };
}

/** Sign the 2-link chain principal →(masterCap)→ worker →(subCap)→ relayer. */
async function buildSubBudget(opts: {
  principal: SmartAccount;
  worker: SmartAccount;
  token: `0x${string}`;
  targetAddress: `0x${string}`;
  masterCap: bigint;
  subCap: bigint;
}): Promise<unknown[]> {
  const { principal, worker, token, targetAddress, masterCap, subCap } = opts;
  const root = buildBudgetDelegation({
    environment: principal.account.environment,
    from: principal.account.address,
    to: worker.account.address,
    token,
    maxAmount: masterCap,
  });
  const rootSig = await principal.account.signDelegation({ delegation: root });
  const rootSigned = { ...root, signature: rootSig } as SignedDelegation;

  const child = buildRedelegation({
    environment: worker.account.environment,
    manager: worker.account.address,
    worker: targetAddress,
    token,
    maxAmount: subCap,
    parent: rootSigned,
  });
  const childSig = await worker.account.signDelegation({ delegation: child });
  const childSigned = { ...child, signature: childSig } as SignedDelegation;
  return toPermissionContext([childSigned, rootSigned]);
}

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

/** Poll a relayer task to a terminal status; surface the receipt tx hash. */
async function settle(
  relayer: OneShotRelayer,
  taskId: `0x${string}`,
  onTick: (status: number, hash?: string) => void,
): Promise<{ status: number; hash?: string }> {
  for (let i = 0; i < 100; i += 1) {
    const s = await relayer.getStatus(taskId);
    const hash =
      s.hash ||
      (s.receipt as { transactionHash?: string } | undefined)?.transactionHash;
    onTick(s.status, hash);
    if (s.status === 200) return { status: 200, hash };
    if (s.status === 400 || s.status === 500) return { status: s.status, hash };
    await sleep(3000);
  }
  return { status: 0 };
}

/** Hire one worker, grant a sub-budget, buy from its x402 service, log a receipt. */
async function hireAndPay(
  deps: CityDeps,
  spec: WorkerSpec,
  entry: LedgerEntry,
): Promise<void> {
  if (deps.isRevoked?.()) {
    entry.status = "failed";
    entry.error = "authority revoked";
    deps.onUpdate?.();
    return;
  }
  const worker = spec.account; // persistent identity → reputation accrues
  entry.agent = worker.account.address;
  entry.status = "hiring";
  deps.onUpdate?.();

  const alreadyUp = await isUpgraded(
    worker.client,
    worker.owner.address,
    Number(deps.chainId),
  );
  const authorization = alreadyUp
    ? undefined
    : await buildUpgradeAuthorization(
        worker.owner,
        worker.client,
        Number(deps.chainId),
      );

  const context = await buildSubBudget({
    principal: deps.principal,
    worker,
    token: deps.token,
    targetAddress: deps.targetAddress,
    masterCap: spec.masterCap,
    subCap: spec.subCap,
  });
  const executor = new DelegatedExecutor({
    relayer: deps.relayer,
    chainId: deps.chainId,
    resolveContext: staticResolver(context),
    authorization,
  });

  // Pay-per-call: GET the x402 service; on 402, settle the price under the cap.
  entry.status = "paying";
  deps.onUpdate?.();
  const sink: { taskId?: string } = {};
  const payer = new DelegatedPayer(
    recordingExecutor(executor, sink),
    spec.subCap,
  );
  try {
    const res = await new X402Client(payer).fetch(spec.serviceUrl);
    const body = (await res.json()) as { data?: string };
    if (res.status !== 200)
      throw new Error(`x402 service returned ${res.status}`);
    entry.data = body.data;
  } catch (err) {
    entry.status = "failed";
    entry.error = (err as Error).message;
    deps.onUpdate?.();
    return;
  }
  entry.taskId = sink.taskId;
  if (!sink.taskId) {
    entry.status = "failed";
    deps.onUpdate?.();
    return;
  }

  const { status, hash } = await settle(
    deps.relayer,
    sink.taskId as `0x${string}`,
    (_s, h) => {
      if (h && !entry.txHash) {
        entry.txHash = h;
        deps.onUpdate?.();
      }
    },
  );
  entry.txHash = hash ?? entry.txHash;
  if (status === 0) {
    // Timed out without a terminal status — leave it pending, don't penalize reputation.
    entry.status = "pending";
    entry.error = "still pending after the poll window (not a failure)";
    deps.onUpdate?.();
    return;
  }
  entry.status = status === 200 ? "settled" : "failed";
  entry.settled = status === 200;
  recordReceipt(
    deps.repStore,
    worker.account.address,
    BigInt(spec.payAmount),
    status === 200,
  );
  const c = credit(deps.repStore, worker.account.address);
  entry.credit = c.score;
  entry.tier = c.tier;
  deps.onUpdate?.();
}

/** Run the city: hire each worker in turn, buying from x402 services on-chain. */
export async function runCity(
  deps: CityDeps,
  run: CityRun,
  specs: WorkerSpec[],
): Promise<CityRun> {
  run.status = "running";
  for (const spec of specs) {
    const entry: LedgerEntry = {
      role: spec.role,
      service: spec.service,
      agent: "0x",
      payTo: spec.payTo,
      amount: spec.payAmount.toString(),
      masterCap: spec.masterCap.toString(),
      subCap: spec.subCap.toString(),
      status: "queued",
      settled: false,
    };
    run.ledger.push(entry);
    deps.onUpdate?.();
    try {
      await hireAndPay(deps, spec, entry);
    } catch (err) {
      entry.status = "failed";
      entry.error = (err as Error).message;
      deps.onUpdate?.();
    }
  }
  run.status = run.ledger.every((e) => e.settled) ? "done" : "failed";
  run.result = summarize(run);
  deps.onUpdate?.();
  return run;
}

function summarize(run: CityRun): string {
  const ok = run.ledger.filter((e) => e.settled).length;
  const total = run.ledger.reduce(
    (n, e) => (e.settled ? n + BigInt(e.amount) : n),
    0n,
  );
  return `${ok}/${run.ledger.length} agents paid via x402 · ${total.toString()} base units settled on-chain (${run.ledger
    .map((e) => `${e.role} ${shrink(e.agent)}`)
    .join(", ")}).`;
}

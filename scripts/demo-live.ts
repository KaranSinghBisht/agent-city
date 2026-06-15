/**
 * THE COMPLETE LOOP (headless): Venice reads the treasury balance through its own
 * Crypto-RPC, the private model decides + proposes a spend, a human approves, and
 * the action redeems ON-CHAIN through the 1Shot relayer (gas in USDC, 7702). This
 * is the whole product in one run — the spine the demo video shows.
 *
 * Run: npm run demo            (uses CHAIN/.env; start on baseSepolia)
 */
import { BoundedAgent } from "../src/agent/planner.js";
import type { AgentEvent } from "../src/agent/types.js";
import { createLiveAgent } from "../src/live.js";

const log = (m: string): void => {
  process.stdout.write(m + "\n");
};
const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

async function main(): Promise<void> {
  const live = await createLiveAgent();
  log(`Treasury smart account: ${live.account.address}`);

  const context = await live.onchainContext();
  log(`\n${context}\n`);

  const goal =
    `${context}\n\nGoal: settle a 0.05 ${live.tokenSymbol} test payment to ${live.owner.address} ` +
    `(0.05 ${live.tokenSymbol} = ${0.05 * 10 ** live.tokenDecimals} base units). Propose the transfer; ` +
    `after it executes, finalize with a one-line summary.`;

  const agent = new BoundedAgent(live.reasoner, live.policy, live.executor);
  let state = await agent.resume(agent.start(goal));

  if (state.status === "awaiting_approval" && state.pending) {
    log(`\nPENDING (human gate): ${JSON.stringify(state.pending.action)}`);
    log(">>> approving\n");
    state = await agent.approve(state, true, "approved (headless demo)");
  }

  for (const e of state.audit as AgentEvent[]) {
    log(` - ${e.kind} ${JSON.stringify(e.data).slice(0, 220)}`);
  }
  log(`\nRESULT: ${state.result ?? state.error} | status: ${state.status}`);

  const executed = [...state.audit]
    .reverse()
    .find((e) => e.kind === "executed");
  const taskId = (executed?.data as { taskId?: string } | undefined)?.taskId;
  if (taskId && taskId !== "dry-run") {
    log(`\nPolling 1Shot task ${taskId} ...`);
    for (let i = 0; i < 100; i += 1) {
      const s = await live.relayer.getStatus(taskId as `0x${string}`);
      log(`status ${s.status}${s.hash ? ` · tx ${s.hash}` : ""}`);
      if (s.status === 200) {
        log("✅ Confirmed on-chain — the complete loop works.");
        return;
      }
      if (s.status === 400 || s.status === 500) {
        log(`❌ terminal failure (${s.status})`);
        process.exitCode = 1;
        return;
      }
      await sleep(3000);
    }
  }
}

main().catch((e: unknown) => {
  process.stderr.write(`demo-live failed: ${(e as Error).message}\n`);
  process.exitCode = 1;
});

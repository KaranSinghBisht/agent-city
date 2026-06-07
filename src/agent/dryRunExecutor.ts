/**
 * Simulates on-chain execution so the agent loop + approval gate can be demoed
 * (and tested) with real Venice reasoning but no chain, keys, or gas. Swap for
 * DelegatedExecutor (src/delegation/executor.ts) to go live.
 */
import type { Executor } from "./planner.js";
import type { ExecutionResult, ProposedAction } from "./types.js";

export class DryRunExecutor implements Executor {
  async execute(_action: ProposedAction): Promise<ExecutionResult> {
    return { ok: true, taskId: "dry-run", txStatus: "simulated" };
  }
}

import { describe, expect, it } from "vitest";

import type { ChatMessage, Reasoner } from "../venice.js";
import { parseDecision, BoundedAgent, type Executor } from "./planner.js";
import type { Policy } from "./policy.js";
import type { ExecutionResult, ProposedAction } from "./types.js";

class FakeReasoner implements Reasoner {
  private index = 0;
  constructor(private readonly scripted: string[]) {}
  async complete(_messages: ChatMessage[]): Promise<string> {
    return this.scripted[this.index++] ?? '{"action":"final","output":"done"}';
  }
}

class FakeExecutor implements Executor {
  public calls: ProposedAction[] = [];
  async execute(action: ProposedAction): Promise<ExecutionResult> {
    this.calls.push(action);
    return { ok: true, taskId: "task-1", txStatus: "Confirmed" };
  }
}

const policy: Policy = {
  token: "0xusdc",
  maxPerTx: 100n,
  maxPerDay: 250n,
  allowedTargets: new Set(["0xmerchant"]),
};

const propose = (amount: string, to = "0xmerchant") =>
  JSON.stringify({ action: "propose", proposal: { kind: "transfer", to, token: "0xusdc", amount, reason: "pay" } });

describe("parseDecision", () => {
  it("parses a propose action and strips code fences", () => {
    const decision = parseDecision('```json\n' + propose("10") + "\n```");
    expect(decision.kind).toBe("propose");
  });

  it("throws on invalid JSON", () => {
    expect(() => parseDecision("not json")).toThrow();
  });
});

describe("BoundedAgent loop", () => {
  it("pauses for approval, then executes and tracks spend on approve", async () => {
    const reasoner = new FakeReasoner([propose("50"), JSON.stringify({ action: "final", output: "Paid." })]);
    const executor = new FakeExecutor();
    const agent = new BoundedAgent(reasoner, policy, executor);

    let state = await agent.resume(agent.start("pay the invoice"));
    expect(state.status).toBe("awaiting_approval");
    expect(state.pending?.action.amount).toBe("50");

    state = await agent.approve(state, true, "ok");
    expect(state.status).toBe("done");
    expect(executor.calls).toHaveLength(1);
    expect(state.spentToday).toBe("50");
  });

  it("does not execute a rejected action", async () => {
    const reasoner = new FakeReasoner([propose("50"), JSON.stringify({ action: "final", output: "Cancelled." })]);
    const executor = new FakeExecutor();
    const agent = new BoundedAgent(reasoner, policy, executor);

    let state = await agent.resume(agent.start("pay"));
    state = await agent.approve(state, false, "no");
    expect(state.status).toBe("done");
    expect(executor.calls).toHaveLength(0);
  });

  it("re-prompts the agent when the policy blocks an action", async () => {
    const reasoner = new FakeReasoner([propose("10", "0xstranger"), JSON.stringify({ action: "final", output: "ok" })]);
    const executor = new FakeExecutor();
    const agent = new BoundedAgent(reasoner, policy, executor);

    const state = await agent.resume(agent.start("go"));
    expect(state.status).toBe("done");
    expect(state.audit.some((e) => e.kind === "policy_block")).toBe(true);
    expect(executor.calls).toHaveLength(0);
  });
});

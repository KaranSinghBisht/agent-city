/** Core agent types. The action is an on-chain *intent* the agent wants to take. */
import type { ChatMessage } from "../venice.js";

export type RunStatus = "running" | "awaiting_approval" | "done" | "failed";

export interface ProposedAction {
  kind: "transfer" | "call";
  to: `0x${string}`;
  /** ERC-20 token for a transfer (e.g. USDC). */
  token?: `0x${string}`;
  /** Base units (e.g. USDC has 6 decimals) for a transfer. */
  amount?: string;
  /** Calldata for a `call`. */
  data?: `0x${string}`;
  /** The agent's justification — surfaced to the human at the approval gate. */
  reason: string;
}

export interface ApprovalRequest {
  id: string;
  action: ProposedAction;
  policyReason: string;
}

export interface AgentEvent {
  ts: number;
  kind: string;
  data: Record<string, unknown>;
}

export interface ExecutionResult {
  ok: boolean;
  taskId?: string;
  txStatus?: string;
  error?: string;
}

export interface RunState {
  id: string;
  goal: string;
  status: RunStatus;
  messages: ChatMessage[];
  audit: AgentEvent[];
  pending: ApprovalRequest | null;
  /** Base units spent so far (for the daily-cap check). */
  spentToday: string;
  result: string | null;
  error: string | null;
  stepsUsed: number;
}

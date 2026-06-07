/**
 * The off-chain policy gate. It mirrors the on-chain delegation caveats (the hard
 * cap) so the agent never even *proposes* something the chain would reject — and
 * gates every value-moving action behind human approval. Pure + unit-tested.
 */
import type { ProposedAction } from "./types.js";

export interface Policy {
  /** The single ERC-20 the delegated budget is denominated in (e.g. USDC). */
  token: `0x${string}`;
  /** Per-transaction cap, base units. */
  maxPerTx: bigint;
  /** Rolling daily cap, base units. */
  maxPerDay: bigint;
  /** Lowercased addresses the agent is allowed to pay. */
  allowedTargets: Set<string>;
}

export interface PolicyVerdict {
  /** Within the hard caps (i.e. the chain would permit it)? */
  allowed: boolean;
  /** Even if allowed, require a human to approve first? */
  requiresApproval: boolean;
  reason: string;
}

function block(reason: string): PolicyVerdict {
  return { allowed: false, requiresApproval: false, reason };
}

export function checkPolicy(
  action: ProposedAction,
  policy: Policy,
  spentToday: bigint,
): PolicyVerdict {
  if (!policy.allowedTargets.has(action.to.toLowerCase())) {
    return block(`target ${action.to} is not on the allowed list`);
  }
  if (action.kind === "call") {
    return { allowed: true, requiresApproval: true, reason: "arbitrary call requires human approval" };
  }
  if (action.token && action.token.toLowerCase() !== policy.token.toLowerCase()) {
    return block(`token ${action.token} is outside the delegated budget token`);
  }
  let amount: bigint;
  try {
    amount = BigInt(action.amount ?? "0");
  } catch {
    return block("amount is not a valid integer (base units)");
  }
  if (amount <= 0n) {
    return block("transfer amount must be greater than 0");
  }
  if (amount > policy.maxPerTx) {
    return block(`amount exceeds the per-transaction cap (${policy.maxPerTx})`);
  }
  if (spentToday + amount > policy.maxPerDay) {
    return block(`amount would exceed the daily cap (${policy.maxPerDay})`);
  }
  return { allowed: true, requiresApproval: true, reason: "spend within budget; human approval required" };
}

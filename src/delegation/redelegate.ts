/**
 * A2A: a manager (a delegate that received a budget) sub-delegates a narrower,
 * capped budget to a worker agent. The child delegation chains to the parent via
 * `authority = hashDelegation(parent)`, so the worker can only ever spend inside
 * BOTH caps — the chain itself is the agent-to-agent coordination primitive.
 */
import { createDelegation, ScopeType } from "@metamask/smart-accounts-kit";

import { randomSalt } from "./delegation.js";
import type { Delegation } from "./redeem.js";

export interface RedelegationGrant {
  environment: Parameters<typeof createDelegation>[0]["environment"];
  /** The delegate that holds the parent budget (the manager). */
  manager: `0x${string}`;
  /** The sub-agent receiving a capped slice. */
  worker: `0x${string}`;
  token: `0x${string}`;
  /** Sub-budget in base units (must be ≤ the parent's cap). */
  maxAmount: bigint;
  /** The parent (signed) delegation this one chains under. */
  parent: Delegation;
}

export function buildRedelegation(grant: RedelegationGrant): Delegation {
  return createDelegation({
    to: grant.worker,
    from: grant.manager,
    environment: grant.environment,
    salt: randomSalt(),
    scope: {
      type: ScopeType.Erc20TransferAmount,
      tokenAddress: grant.token,
      maxAmount: grant.maxAmount,
    },
    parentDelegation: grant.parent,
  });
}

/**
 * Builds a scoped ERC-20 spending delegation — the on-chain twin of the agent's
 * policy gate. The scope (`Erc20TransferAmount`) caps how much of `token` the
 * delegate may move; the chain enforces it regardless of what the agent does.
 *
 * NOTE: for the 1Shot relayer, `to` MUST be the relayer's `targetAddress` (from
 * `relayer_getCapabilities`) — the relayer is the on-chain delegate that redeems.
 */
import { randomBytes } from "node:crypto";

import { createDelegation, ScopeType } from "@metamask/smart-accounts-kit";
import { bytesToHex } from "viem/utils";

export interface BudgetGrant {
  /** The delegator smart account's DeleGator environment (account.environment). */
  environment: Parameters<typeof createDelegation>[0]["environment"];
  /** Delegator (principal smart account). */
  from: `0x${string}`;
  /** Delegate — the relayer's `targetAddress`. */
  to: `0x${string}`;
  /** ERC-20 the budget is denominated in (e.g. USDC). */
  token: `0x${string}`;
  /** Total budget the delegate may spend, in base units. */
  maxAmount: bigint;
}

/** Fresh 32-byte salt per delegation to avoid replay collisions. */
export function randomSalt(): `0x${string}` {
  return bytesToHex(Uint8Array.from(randomBytes(32)));
}

export function buildBudgetDelegation(grant: BudgetGrant) {
  return createDelegation({
    to: grant.to,
    from: grant.from,
    environment: grant.environment,
    salt: randomSalt(),
    scope: {
      type: ScopeType.Erc20TransferAmount,
      tokenAddress: grant.token,
      maxAmount: grant.maxAmount,
    },
  });
}

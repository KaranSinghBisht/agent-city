/**
 * Turns an agent action into the two artifacts the 1Shot relayer redeems:
 *   (a) `permissionContext` — the JSON-safe signed delegation chain, and
 *   (b) `executions`        — the on-chain calls (fee transfer + work transfer).
 * The relayer performs the on-chain `redeemDelegations`, so we only build here.
 */
import type { createDelegation } from "@metamask/smart-accounts-kit";
import { encodeFunctionData, erc20Abi } from "viem";

import type { Execution7710 } from "../relayer.js";
import { toRelayerJson } from "../relayerJson.js";

/** A delegation as produced by createDelegation. */
export type Delegation = ReturnType<typeof createDelegation>;
/** A signed delegation (createDelegation's result plus the signature). */
export type SignedDelegation = Delegation & { signature: `0x${string}` };

/**
 * ERC-7710 permission context = the signed delegation chain, made JSON-safe
 * (bigints → hex) for JSON-RPC. Accepts a single root delegation or a
 * redelegation chain `[child, …, parent]` (A2A).
 */
export function toPermissionContext(
  signed: SignedDelegation | SignedDelegation[],
): unknown[] {
  const chain = Array.isArray(signed) ? signed : [signed];
  return chain.map((d) => toRelayerJson(d));
}

/** Build a "transfer `amount` of `token` to `to`" execution for the relayer. */
export function buildTransferExecution(
  token: `0x${string}`,
  to: `0x${string}`,
  amount: bigint,
): Execution7710 {
  return {
    target: token,
    value: "0",
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [to, amount],
    }),
  };
}

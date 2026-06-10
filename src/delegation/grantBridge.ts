/**
 * Bridges a browser ERC-7715 Advanced Permissions grant into the 1Shot relayer
 * path. MetaMask returns a hex `context` — the ABI-encoded signed delegation
 * chain — which the Kit's `decodeDelegations` turns back into Delegation structs.
 * The city then chains each worker's sub-budget UNDER the grant (A2A), so every
 * payment redeems against the wallet that granted, not a backend treasury.
 *
 * The grant arrives from a browser, so everything is validated hard here at the
 * boundary before anything is decoded or chained.
 */
import { decodeDelegations } from "@metamask/smart-accounts-kit/utils";

import type { SignedDelegation } from "./redeem.js";

const HEX_RE = /^0x[0-9a-fA-F]+$/;
/** Hard cap on a browser-supplied context blob (a real chain is a few KB). */
const MAX_CONTEXT_CHARS = 128 * 1024;

export interface ParsedGrant {
  /** The raw hex permission context, as returned by MetaMask. */
  context: `0x${string}`;
  /** The decoded signed chain, leaf-first; `chain[0].delegate` is the city agent. */
  chain: SignedDelegation[];
  /** The wallet that granted — the root delegator whose funds the city spends. */
  delegator: `0x${string}`;
}

/**
 * Pull the first plausible `context` hex out of the POSTed grant body. A real
 * MetaMask response is ≤3 levels deep, so depth/breadth are hard-capped to keep
 * a hostile body from spinning the search. Safe against prototype tricks:
 * JSON.parse yields plain objects and only named properties are read.
 */
function findContext(raw: unknown, depth = 0): string | null {
  if (depth > 6) return null;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    for (const item of raw.slice(0, 20)) {
      const found = findContext(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.context === "string") return obj.context;
    // Our /grant page posts `{ granted: PermissionResponse[], account }`.
    if (obj.granted !== undefined) return findContext(obj.granted, depth + 1);
  }
  return null;
}

function isSigned(d: SignedDelegation): boolean {
  return (
    typeof d.signature === "string" &&
    HEX_RE.test(d.signature) &&
    d.signature.length > 4
  );
}

/**
 * Validate and decode a grant POSTed by the /grant page. Throws (with a safe,
 * non-sensitive message) on anything malformed; returns the decoded chain.
 * `agent` is the city's redeeming account — the grant must be made to it.
 */
export function parseGrant(raw: unknown, agent: `0x${string}`): ParsedGrant {
  const context = findContext(raw);
  if (!context) throw new Error("grant body carries no permission context");
  if (
    !HEX_RE.test(context) ||
    context.length % 2 !== 0 ||
    context.length > MAX_CONTEXT_CHARS
  ) {
    throw new Error("permission context is not valid hex");
  }

  let chain: SignedDelegation[];
  try {
    chain = decodeDelegations(context as `0x${string}`) as SignedDelegation[];
  } catch {
    throw new Error("permission context did not decode to a delegation chain");
  }
  if (chain.length === 0) {
    throw new Error("permission context decoded to an empty chain");
  }
  if (!chain.every(isSigned)) {
    throw new Error("granted delegation chain is not fully signed");
  }

  const leaf = chain[0] as SignedDelegation;
  if (leaf.delegate.toLowerCase() !== agent.toLowerCase()) {
    throw new Error("grant is not delegated to the city agent");
  }

  const root = chain[chain.length - 1] as SignedDelegation;
  return {
    context: context as `0x${string}`,
    chain,
    delegator: root.delegator as `0x${string}`,
  };
}

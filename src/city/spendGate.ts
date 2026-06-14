/**
 * Venice spend-gate — "Private Agents, Trusted Actions".
 *
 * Before any worker redelegates and spends under its ERC-7710 sub-budget, its
 * spend INTENT is judged privately by Venice (zero-retention) and wrapped in a
 * deterministic cap-guard. The on-chain action only fires if the gate approves,
 * so private cognition literally gates the trusted on-chain action.
 *
 * The deterministic guard is the hard floor (always enforced). Venice supplies
 * the private judgment on top. On a Venice outage the gate fails open to the
 * floor — a hiccup must never strand a within-policy spend — and says so plainly.
 */
import { formatUnits } from "viem";

import { type Reasoner, VeniceReasoner } from "../venice.js";
import type { CityDeps } from "./types.js";

export interface SpendVerdict {
  approved: boolean;
  reason: string;
}

const USDC_DECIMALS = 6;
const usdc = (n: bigint): string => `${formatUnits(n, USDC_DECIMALS)} USDC`;

/** Pull the first JSON object out of a model reply and read its approve flag. */
export function parseVerdict(raw: string): SpendVerdict | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const o = JSON.parse(match[0]) as { approve?: unknown; reason?: unknown };
    if (typeof o.approve !== "boolean") return null;
    const reason =
      typeof o.reason === "string" ? o.reason.trim().slice(0, 140) : "";
    return { approved: o.approve, reason };
  } catch {
    return null;
  }
}

/**
 * Build the spend-gate. Inject a Reasoner in tests; defaults to Venice.
 */
export function buildSpendGate(
  reasoner: Reasoner = new VeniceReasoner(),
): NonNullable<CityDeps["judge"]> {
  return async (q) => {
    // 1. Deterministic guard — the hard floor. The chain would also revert an
    //    over-cap spend, but the gate stops it before any on-chain work happens.
    if (q.amount <= 0n) return { approved: false, reason: "non-positive amount" };
    if (q.amount > q.subCap) {
      return {
        approved: false,
        reason: `over sub-budget cap (${usdc(q.amount)} > ${usdc(q.subCap)})`,
      };
    }

    // 2. Private Venice judgment on top of the floor.
    let verdict: SpendVerdict | null = null;
    try {
      const raw = await reasoner.complete([
        {
          role: "system",
          content:
            "You are a private, zero-retention spend-approval gate for a treasury " +
            "agent. Approve a purchase only if it plausibly serves the goal and is " +
            "within the stated on-chain cap. Reply with STRICT JSON and nothing " +
            'else: {"approve": true|false, "reason": "<=14 words"}.',
        },
        {
          role: "user",
          content:
            `Goal: ${q.goal.slice(0, 300)}\n` +
            `Worker: ${q.role.slice(0, 60)}\n` +
            `Buying: ${q.service.slice(0, 60)}\n` +
            `Price: ${usdc(q.amount)}\n` +
            `On-chain cap: ${usdc(q.subCap)}`,
        },
      ]);
      verdict = parseVerdict(raw);
    } catch {
      verdict = null; // fall through to the deterministic floor below
    }

    if (!verdict) {
      return {
        approved: true,
        reason: "within cap · deterministic policy (Venice judgment unavailable)",
      };
    }
    return verdict;
  };
}

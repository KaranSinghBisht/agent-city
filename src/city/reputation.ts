/**
 * Agent reputation earned from settled payments. Credit accrues ONLY when the
 * relayer reports a payment settled on-chain (a City Ledger receipt); the amount
 * credited is the agreed x402 price of that payment — it is not re-read from the
 * chain. ERC-8004-flavoured: behaviour-earned, not asserted. Kept in memory for
 * the demo (resets on restart).
 */
export interface RepStats {
  runs: number;
  paid: number;
  settledBase: bigint;
}

export type ReputationStore = Map<string, RepStats>;

export function recordReceipt(
  store: ReputationStore,
  address: string,
  base: bigint,
  settled: boolean,
): void {
  const key = address.toLowerCase();
  const s = store.get(key) ?? { runs: 0, paid: 0, settledBase: 0n };
  s.runs += 1;
  if (settled) {
    s.paid += 1;
    s.settledBase += base;
  }
  store.set(key, s);
}

export interface Credit {
  score: number; // 0–100
  tier: "New" | "Bronze" | "Silver" | "Gold";
  paid: number;
}

/** Credit from history: 25 per settled payment + a small volume bonus, capped at 100. */
export function credit(store: ReputationStore, address: string): Credit {
  const s = store.get(address.toLowerCase()) ?? {
    runs: 0,
    paid: 0,
    settledBase: 0n,
  };
  const volumeUsdc = Number(s.settledBase) / 1e6;
  const score = Math.min(100, Math.round(s.paid * 25 + volumeUsdc * 30));
  const tier =
    score >= 80
      ? "Gold"
      : score >= 50
        ? "Silver"
        : score >= 20
          ? "Bronze"
          : "New";
  return { score, tier, paid: s.paid };
}

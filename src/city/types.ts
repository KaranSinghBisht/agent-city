/** Agent City shared types. The ledger is a list of on-chain payment receipts. */
import type { SignedDelegation } from "../delegation/redeem.js";
import { createSmartAccountFromKey } from "../delegation/smartAccount.js";
import type { OneShotRelayer } from "../relayer.js";
import type { ReputationStore } from "./reputation.js";

export type SmartAccount = Awaited<
  ReturnType<typeof createSmartAccountFromKey>
>;

/** One worker the Manager hires: a persistent agent + the x402 service + budget. */
export interface WorkerSpec {
  role: string; // e.g. "Research agent"
  service: string; // e.g. "Market-Data API"
  account: SmartAccount; // persistent identity (so reputation accrues)
  masterCap: bigint; // principal → worker (the budget it's handed)
  subCap: bigint; // worker → relayer (narrower; sized by reputation)
  payAmount: bigint; // the service's price (base units)
  payTo: `0x${string}`; // the service it pays
  serviceUrl: string; // the x402 endpoint it buys from
  reason: string;
}

export type EntryStatus =
  | "queued"
  | "hiring"
  | "paying"
  | "settled"
  | "failed"
  | "pending"
  | "blocked";

/** A City Ledger line — a verifiable on-chain receipt of one agent's payment. */
export interface LedgerEntry {
  role: string;
  service?: string;
  agent: `0x${string}` | "0x";
  payTo: `0x${string}`;
  amount: string; // base units
  masterCap: string;
  subCap: string;
  status: EntryStatus;
  settled: boolean;
  taskId?: string;
  txHash?: string;
  data?: string; // the resource the agent received from the x402 service
  reasoning?: string; // the agent's Venice-reasoned purchase decision
  gate?: { approved: boolean; reason: string }; // Venice spend-gate verdict (private cognition → trusted action)
  credit?: number; // earned credit score after this receipt
  tier?: string;
  error?: string;
}

export interface CityRun {
  id: string;
  goal: string;
  status: "queued" | "running" | "done" | "failed";
  ledger: LedgerEntry[];
  result?: string;
  /** The final deliverable Venice composes from what the workers actually purchased. */
  deliverable?: string;
  network?: string;
  explorerTxBase?: string;
  /** Whose authority roots the payments: a browser ERC-7715 grant or the demo treasury. */
  authorityRoot?: "grant" | "treasury";
  /** The wallet that granted, when authorityRoot is "grant". */
  grantDelegator?: string;
}

export interface CityDeps {
  relayer: OneShotRelayer;
  chainId: string;
  token: `0x${string}`;
  targetAddress: `0x${string}`;
  decimals: number;
  principal: SmartAccount; // already 7702-upgraded (root delegator)
  repStore: ReputationStore; // accrues across runs (server memory)
  /** Called whenever the run mutates, so the API can stream progress to the UI. */
  onUpdate?: () => void;
  /** If it returns true, the orchestrator stops before the next worker's redemption. */
  isRevoked?: () => boolean;
  /**
   * A browser-granted ERC-7715 delegation chain (leaf delegate = the principal).
   * When present, every worker's sub-budget chains UNDER it, so payments redeem
   * against the granting wallet instead of the demo treasury.
   */
  grantChain?: SignedDelegation[];
  /** Venice-powered purchase reasoning; optional enrichment, never load-bearing. */
  reason?: (q: {
    goal: string;
    role: string;
    service: string;
  }) => Promise<string>;
  /**
   * Venice spend-gate: privately judges each worker's spend intent BEFORE the
   * on-chain redelegation fires (private cognition → trusted action). A
   * deterministic cap-guard is the hard floor; Venice supplies the judgment.
   */
  judge?: (q: {
    goal: string;
    role: string;
    service: string;
    amount: bigint;
    subCap: bigint;
  }) => Promise<{ approved: boolean; reason: string }>;
  /**
   * Verified 1Shot webhook status cache. When present, settle() reads it PUSH-first
   * (a signed webhook gives sub-second status) and only polls the relayer as a fallback.
   */
  webhookInbox?: {
    lookup: (id: string) => { status: number; hash?: string } | undefined;
  };
  /**
   * Venice composes the run's final deliverable from what the workers actually
   * purchased (e.g. a market brief from the price + sentiment data). Non-fatal enrichment.
   */
  compose?: (q: {
    goal: string;
    findings: { role: string; service?: string; data?: string }[];
  }) => Promise<string>;
}

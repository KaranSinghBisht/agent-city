/** Agent City shared types. The ledger is a list of on-chain payment receipts. */
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
  | "pending";

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
  network?: string;
  explorerTxBase?: string;
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
}

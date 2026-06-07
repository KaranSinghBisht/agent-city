/** Agent City shared types. The ledger is a list of on-chain payment receipts. */
import { createSmartAccountFromKey } from "../delegation/smartAccount.js";
import type { OneShotRelayer } from "../relayer.js";

export type SmartAccount = Awaited<ReturnType<typeof createSmartAccountFromKey>>;

/** One worker the Manager hires: role, the service it pays, and its capped budget. */
export interface WorkerSpec {
  role: string; // e.g. "Research agent"
  service: string; // e.g. "Market-Data API"
  masterCap: bigint; // principal → worker (the budget it's handed)
  subCap: bigint; // worker → relayer (narrower; the A2A point)
  payAmount: bigint; // what it actually spends (base units)
  payTo: `0x${string}`; // the service it pays
  reason: string;
}

export type EntryStatus =
  | "queued"
  | "hiring"
  | "paying"
  | "settled"
  | "failed";

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
  /** Called whenever the run mutates, so the API can stream progress to the UI. */
  onUpdate?: () => void;
}

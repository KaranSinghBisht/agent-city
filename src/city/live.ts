/**
 * Live wiring for Agent City: builds on-chain deps (Mayor/principal, relayer,
 * capabilities) from .env, a PERSISTENT worker roster (so reputation accrues
 * across runs), and a reputation store. The Manager sizes each worker's
 * sub-budget by its earned credit. Throws without creds.
 */
import { parseUnits } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { resolveChain } from "../chains.js";
import { config } from "../config.js";
import {
  createPrincipalAccount,
  createSmartAccountFromKey,
  isUpgraded,
} from "../delegation/smartAccount.js";
import { OneShotRelayer } from "../relayer.js";
import { credit, type ReputationStore } from "./reputation.js";
import type { CityDeps, SmartAccount, WorkerSpec } from "./types.js";

interface RosterEntry {
  role: string;
  service: string;
  account: SmartAccount;
  serviceAddr: `0x${string}`;
}

export interface CityBase {
  deps: Omit<CityDeps, "onUpdate">;
  network: string;
  explorerTxBase: string;
  makeSpecs: (goal: string) => WorkerSpec[];
}

export async function createCityBase(): Promise<CityBase> {
  const { chainId, relayerUrl, isTestnet } = resolveChain(config.chainName);
  const principal = await createPrincipalAccount();
  const relayer = new OneShotRelayer(relayerUrl);
  const chainCaps = (await relayer.getCapabilities([chainId]))[chainId];
  if (!chainCaps) throw new Error(`relayer has no capabilities for ${chainId}`);
  const usdc =
    chainCaps.tokens.find((t) => t.symbol?.toUpperCase() === "USDC") ??
    chainCaps.tokens[0];
  if (!usdc) throw new Error("relayer advertises no payment tokens");
  if (
    !(await isUpgraded(principal.client, principal.owner.address, Number(chainId)))
  ) {
    throw new Error("treasury not 7702-upgraded — run `npm run prove` once first.");
  }
  const dp = Number(usdc.decimals);
  const repStore: ReputationStore = new Map();

  // Persistent roster (created once) so each worker's reputation builds over runs.
  const newSvc = (): `0x${string}` =>
    privateKeyToAccount(generatePrivateKey()).address;
  const roster: RosterEntry[] = [
    { role: "Research agent", service: "Market-Data API", account: await createSmartAccountFromKey(generatePrivateKey()), serviceAddr: newSvc() },
    { role: "Analyst agent", service: "Sentiment API", account: await createSmartAccountFromKey(generatePrivateKey()), serviceAddr: newSvc() },
  ];

  const makeSpecs = (): WorkerSpec[] =>
    roster.map((r) => {
      const c = credit(repStore, r.account.account.address);
      const sub = 0.2 + (c.score / 100) * 0.3; // 0.20 → 0.50 USDC, by reputation
      return {
        role: r.role,
        service: r.service,
        account: r.account,
        masterCap: parseUnits("0.5", dp),
        subCap: parseUnits(sub.toFixed(2), dp),
        payAmount: parseUnits("0.05", dp),
        payTo: r.serviceAddr,
        reason: `pay ${r.service}`,
      };
    });

  return {
    deps: {
      relayer,
      chainId,
      token: usdc.address,
      targetAddress: chainCaps.targetAddress,
      decimals: dp,
      principal,
      repStore,
    },
    network: config.chainName,
    explorerTxBase: isTestnet
      ? "https://sepolia.basescan.org/tx/"
      : "https://basescan.org/tx/",
    makeSpecs,
  };
}

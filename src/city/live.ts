/**
 * Live wiring for Agent City: builds the on-chain deps the orchestrator needs
 * (principal/Mayor, relayer, capabilities) from .env, and the default roster of
 * workers the Manager hires. Throws without creds — the API falls back to a
 * "live mode required" response so the rest of the app still runs offline.
 */
import { parseUnits } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { resolveChain } from "../chains.js";
import { config } from "../config.js";
import {
  createPrincipalAccount,
  isUpgraded,
} from "../delegation/smartAccount.js";
import { OneShotRelayer } from "../relayer.js";
import type { CityDeps, WorkerSpec } from "./types.js";

export interface CityBase {
  deps: Omit<CityDeps, "onUpdate">;
  network: string;
  explorerTxBase: string;
  makeSpecs: (goal: string) => WorkerSpec[];
}

function defaultSpecs(dp: number): WorkerSpec[] {
  const svc = (): `0x${string}` =>
    privateKeyToAccount(generatePrivateKey()).address;
  return [
    { role: "Research agent", service: "Market-Data API", masterCap: parseUnits("0.5", dp), subCap: parseUnits("0.3", dp), payAmount: parseUnits("0.05", dp), payTo: svc(), reason: "buy market data" },
    { role: "Analyst agent", service: "Sentiment API", masterCap: parseUnits("0.5", dp), subCap: parseUnits("0.3", dp), payAmount: parseUnits("0.05", dp), payTo: svc(), reason: "buy sentiment signal" },
  ];
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
  return {
    deps: {
      relayer,
      chainId,
      token: usdc.address,
      targetAddress: chainCaps.targetAddress,
      decimals: dp,
      principal,
    },
    network: config.chainName,
    explorerTxBase: isTestnet
      ? "https://sepolia.basescan.org/tx/"
      : "https://basescan.org/tx/",
    makeSpecs: () => defaultSpecs(dp),
  };
}

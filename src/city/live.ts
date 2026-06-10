/**
 * Live wiring for Agent City: on-chain deps (Mayor/principal, relayer, caps), the
 * x402 service market the workers buy from, a PERSISTENT worker roster (so
 * reputation accrues across runs), and a reputation store. The Manager sizes each
 * worker's sub-budget by its earned credit. Throws without creds.
 */
import { parseUnits } from "viem";
import { generatePrivateKey } from "viem/accounts";

import { resolveChain } from "../chains.js";
import { config } from "../config.js";
import {
  createPrincipalAccount,
  createSmartAccountFromKey,
  isUpgraded,
} from "../delegation/smartAccount.js";
import { OneShotRelayer } from "../relayer.js";
import { VeniceReasoner } from "../venice.js";
import { credit, type ReputationStore } from "./reputation.js";
import { startCityServices } from "./services.js";
import type { CityDeps, SmartAccount, WorkerSpec } from "./types.js";

/**
 * Each worker reasons over its purchase with Venice (private model) before it
 * pays. One short sentence; the orchestrator treats failures as non-fatal.
 */
export function buildCityReasoner(): CityDeps["reason"] {
  const venice = new VeniceReasoner();
  return async (q) =>
    venice.complete([
      {
        role: "system",
        content:
          "You are a worker agent in Agent City with a capped USDC budget. " +
          "In ONE sentence (max 25 words), say what you will buy from the " +
          "service and why it serves the goal. No preamble, no quotes.",
      },
      {
        role: "user",
        content:
          `Goal: ${q.goal.slice(0, 400)}\nYour role: ${q.role.slice(0, 80)}\n` +
          `Service on offer: ${q.service.slice(0, 80)}`,
      },
    ]);
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
    !(await isUpgraded(
      principal.client,
      principal.owner.address,
      Number(chainId),
    ))
  ) {
    throw new Error(
      "treasury not 7702-upgraded — run `npm run prove` once first.",
    );
  }
  const dp = Number(usdc.decimals);
  const repStore: ReputationStore = new Map();

  // The x402 service market (kept alive for the server's lifetime).
  const svc = await startCityServices({
    price: parseUnits("0.05", dp),
    network: isTestnet ? "base-sepolia" : "base",
    asset: usdc.address,
  });

  // Persistent roster so each worker's reputation builds over runs.
  const roster: { role: string; account: SmartAccount }[] = [
    {
      role: "Research agent",
      account: await createSmartAccountFromKey(generatePrivateKey()),
    },
    {
      role: "Analyst agent",
      account: await createSmartAccountFromKey(generatePrivateKey()),
    },
  ];

  const makeSpecs = (): WorkerSpec[] =>
    roster.map((r) => {
      const s = svc.services.find((x) => x.role === r.role);
      if (!s) throw new Error(`no service for ${r.role}`);
      const c = credit(repStore, r.account.account.address);
      const sub = 0.5 + (c.score / 100) * 0.5; // 0.50 → 1.00 USDC (covers work + relayer fee)
      return {
        role: r.role,
        service: s.service,
        account: r.account,
        masterCap: parseUnits("1", dp),
        subCap: parseUnits(sub.toFixed(2), dp),
        payAmount: s.price,
        payTo: s.payTo,
        serviceUrl: s.url,
        reason: `pay ${s.service}`,
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
      reason: buildCityReasoner(),
    },
    network: config.chainName,
    explorerTxBase: isTestnet
      ? "https://sepolia.basescan.org/tx/"
      : "https://basescan.org/tx/",
    makeSpecs,
  };
}

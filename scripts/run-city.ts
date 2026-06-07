/**
 * Agent City PROOF: a Manager hires worker agents, each under a capped sub-budget
 * (A2A redelegation), and each settles a REAL payment on-chain via 1Shot. Prints
 * the verifiable City Ledger. Run: npm run city  (CHAIN selects net; .env creds).
 */
import { parseUnits } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { resolveChain } from "../src/chains.js";
import { runCity } from "../src/city/orchestrator.js";
import type { CityDeps, CityRun, WorkerSpec } from "../src/city/types.js";
import { config } from "../src/config.js";
import {
  createPrincipalAccount,
  isUpgraded,
} from "../src/delegation/smartAccount.js";
import { OneShotRelayer } from "../src/relayer.js";

const log = (m: string): void => {
  process.stdout.write(m + "\n");
};
const shrink = (a?: string): string =>
  a ? a.slice(0, 6) + "…" + a.slice(-4) : "—";

async function main(): Promise<void> {
  const { chainId, relayerUrl, isTestnet } = resolveChain(config.chainName);
  log(
    `Chain ${config.chainName} (${chainId}) · ${isTestnet ? "TESTNET" : "MAINNET"}`,
  );

  const principal = await createPrincipalAccount();
  log(`Mayor (root delegator): ${principal.account.address}`);

  const relayer = new OneShotRelayer(relayerUrl);
  const chainCaps = (await relayer.getCapabilities([chainId]))[chainId];
  if (!chainCaps) throw new Error(`relayer has no capabilities for ${chainId}`);
  const usdc =
    chainCaps.tokens.find((t) => t.symbol?.toUpperCase() === "USDC") ??
    chainCaps.tokens[0];
  if (!usdc) throw new Error("relayer advertises no payment tokens");
  const dp = Number(usdc.decimals);

  if (
    !(await isUpgraded(
      principal.client,
      principal.owner.address,
      Number(chainId),
    ))
  ) {
    throw new Error(
      "principal not 7702-upgraded — run `npm run prove` once first.",
    );
  }
  log("Mayor already 7702-upgraded ✓");

  const svc = (): `0x${string}` =>
    privateKeyToAccount(generatePrivateKey()).address;
  const specs: WorkerSpec[] = [
    {
      role: "Research agent",
      service: "Market-Data API",
      masterCap: parseUnits("0.5", dp),
      subCap: parseUnits("0.3", dp),
      payAmount: parseUnits("0.05", dp),
      payTo: svc(),
      reason: "buy ETH market data",
    },
    {
      role: "Analyst agent",
      service: "Sentiment API",
      masterCap: parseUnits("0.5", dp),
      subCap: parseUnits("0.3", dp),
      payAmount: parseUnits("0.05", dp),
      payTo: svc(),
      reason: "buy sentiment signal",
    },
  ];

  const run: CityRun = {
    id: "cli",
    goal: "Produce a market brief on ETH",
    status: "queued",
    ledger: [],
    network: config.chainName,
  };
  const snap = (): void =>
    log(
      "  " +
        run.ledger
          .map(
            (e) =>
              `${e.role.split(" ")[0]}:${e.status}${e.txHash ? `(${shrink(e.txHash)})` : ""}`,
          )
          .join(" | "),
    );

  const deps: CityDeps = {
    relayer,
    chainId,
    token: usdc.address,
    targetAddress: chainCaps.targetAddress,
    decimals: dp,
    principal,
    onUpdate: snap,
  };

  log(
    `Hiring ${specs.length} workers, each under a capped sub-budget (A2A) → 1Shot...`,
  );
  await runCity(deps, run, specs);

  log("\n=== CITY LEDGER (on-chain receipts) ===");
  for (const e of run.ledger) {
    log(
      `${e.settled ? "✅" : "❌"} ${e.role} ${shrink(e.agent)} → ${e.service}  ` +
        `${Number(e.amount) / 10 ** dp} USDC · ${e.status} · tx ${shrink(e.txHash)}`,
    );
  }
  log(`\n${run.status.toUpperCase()} — ${run.result}`);
  if (run.status !== "done") process.exitCode = 1;
}

main().catch((e: unknown) => {
  process.stderr.write(`run-city failed: ${(e as Error).message}\n`);
  process.exitCode = 1;
});

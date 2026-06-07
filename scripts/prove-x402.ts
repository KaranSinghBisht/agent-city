/**
 * x402 + ERC-7710 PROOF: an HTTP 402 pay-per-call settled ON-CHAIN as a budgeted
 * delegation redemption via 1Shot.
 *
 *   X402Client GETs a 402-gated resource -> DelegatedPayer pays the required USDC
 *   as an ERC-7710 redemption (DelegatedExecutor -> 1Shot, gas in USDC) -> the
 *   client retries with the X-PAYMENT proof -> the server returns 200. The budget
 *   is a hard cap: the agent pays autonomously yet can never exceed it.
 *
 * Settlement scheme here is the 7710 redemption (the "x402 + ERC-7710" track
 * thesis), NOT canonical Coinbase x402 (EIP-3009 transferWithAuthorization). The
 * HTTP 402 handshake is real and the on-chain settlement is a real 1Shot task
 * confirmed to status 200 — verified by the service address actually receiving USDC.
 *
 * Run: npm run prove:x402   (requires .env: RPC_URL, SIGNER_PRIVATE_KEY; CHAIN selects net)
 */
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { erc20Abi, parseUnits } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import type { Executor } from "../src/agent/planner.js";
import type { ExecutionResult, ProposedAction } from "../src/agent/types.js";
import { resolveChain } from "../src/chains.js";
import { config } from "../src/config.js";
import {
  DelegatedExecutor,
  signingResolver,
} from "../src/delegation/executor.js";
import {
  buildUpgradeAuthorization,
  createPrincipalAccount,
  isUpgraded,
} from "../src/delegation/smartAccount.js";
import { OneShotRelayer } from "../src/relayer.js";
import { X402Client } from "../src/x402/client.js";
import { DelegatedPayer } from "../src/x402/payer.js";
import type { PaymentRequirements } from "../src/x402/types.js";

const log = (message: string): void => {
  process.stdout.write(message + "\n");
};
const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

/** Wrap an Executor to capture the taskId of the redemption it submits. */
function recordingExecutor(inner: Executor, sink: { taskId?: string }): Executor {
  return {
    execute: async (action: ProposedAction): Promise<ExecutionResult> => {
      const result = await inner.execute(action);
      if (result.ok && result.taskId) sink.taskId = result.taskId;
      return result;
    },
  };
}

/** A tiny 402-gated "paid API": 402 + challenge first, 200 + resource once paid. */
function startX402Server(
  requirement: PaymentRequirements,
): Promise<{ url: string; close: () => Promise<void> }> {
  const app = new Hono();
  app.get("/insight", (c) => {
    if (c.req.header("X-PAYMENT")) {
      return c.json({ data: "premium insight: regime risk-on; rotate 5% into ETH" });
    }
    return c.json({ x402Version: 1, accepts: [requirement] }, 402);
  });
  return new Promise((resolve) => {
    const server = serve({ fetch: app.fetch, port: 0 }, (info) => {
      resolve({
        url: `http://localhost:${info.port}/insight`,
        close: () => new Promise<void>((res) => server.close(() => res())),
      });
    });
  });
}

async function pollStatus(
  relayer: OneShotRelayer,
  taskId: `0x${string}`,
): Promise<number> {
  for (let i = 0; i < 100; i += 1) {
    const status = await relayer.getStatus(taskId);
    log(`status ${status.status}${status.hash ? ` · tx ${status.hash}` : ""}`);
    if (status.status === 200) return 200;
    if (status.status === 400 || status.status === 500) {
      log(
        `❌ Terminal failure (${status.status}): ${status.message ?? JSON.stringify(status.data ?? "")}`,
      );
      return status.status;
    }
    await sleep(3000);
  }
  return 0;
}

async function main(): Promise<void> {
  const { chainId, relayerUrl, isTestnet } = resolveChain(config.chainName);
  log(
    `Chain ${config.chainName} (${chainId}) · relayer ${relayerUrl} · ${isTestnet ? "TESTNET" : "MAINNET"}`,
  );

  const { account, owner, client } = await createPrincipalAccount();
  log(`Principal (x402 payer) smart account: ${account.address}`);

  const relayer = new OneShotRelayer(relayerUrl);
  const caps = await relayer.getCapabilities([chainId]);
  const chainCaps = caps[chainId];
  if (!chainCaps)
    throw new Error(`relayer has no capabilities for chain ${chainId}`);
  const usdc =
    chainCaps.tokens.find((t) => t.symbol?.toUpperCase() === "USDC") ??
    chainCaps.tokens[0];
  if (!usdc)
    throw new Error("relayer advertises no payment tokens on this chain");
  const dp = Number(usdc.decimals);

  let authorization;
  if (!(await isUpgraded(client, owner.address, Number(chainId)))) {
    authorization = await buildUpgradeAuthorization(owner, client, Number(chainId));
    log("EOA not upgraded — including an EIP-7702 authorization.");
  } else {
    log("Principal already 7702-upgraded ✓.");
  }

  const sink: { taskId?: string } = {};
  const executor = new DelegatedExecutor({
    relayer,
    chainId,
    resolveContext: signingResolver(account),
    authorization,
  });
  const payer = new DelegatedPayer(
    recordingExecutor(executor, sink),
    parseUnits("1", dp), // x402 budget cap: ≤ 1 USDC of pay-per-call
  );

  // The "paid API" service: a fresh recipient that charges 0.05 USDC per call.
  const service = privateKeyToAccount(generatePrivateKey());
  const price = parseUnits("0.05", dp);
  const requirement: PaymentRequirements = {
    scheme: "exact",
    network: isTestnet ? "base-sepolia" : "base",
    maxAmountRequired: price.toString(),
    asset: usdc.address,
    payTo: service.address,
    resource: "venice/insight",
    description: "Premium market insight (pay-per-call)",
  };

  const srv = await startX402Server(requirement);
  log(
    `x402 service up at ${srv.url} · price 0.05 ${usdc.symbol ?? "USDC"} -> ${service.address}`,
  );

  try {
    const x402 = new X402Client(payer); // default global fetch -> localhost
    log("GET the 402-gated resource (auto-pays via ERC-7710 + 1Shot)...");
    const res = await x402.fetch(srv.url);
    const body = (await res.json()) as { data?: string };
    log(
      `HTTP ${res.status} · taskId ${sink.taskId ?? "(none)"} · body ${JSON.stringify(body)}`,
    );

    if (res.status !== 200 || !sink.taskId) {
      process.exitCode = 1;
      return;
    }
    log("Resource unlocked. Confirming the settlement on-chain...");
    const code = await pollStatus(relayer, sink.taskId as `0x${string}`);
    if (code !== 200) {
      process.exitCode = 1;
      return;
    }
    const received = await client.readContract({
      address: usdc.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [service.address],
    });
    log(
      `Service received ${received} base units (expected ${price.toString()}).`,
    );
    if (received === price) {
      log("✅ x402 + ERC-7710 proven on-chain — paid API call settled via 1Shot.");
    } else {
      log("⚠️  Settled, but service balance != price — inspect the redemption.");
      process.exitCode = 1;
    }
  } finally {
    await srv.close();
  }
}

main().catch((err: unknown) => {
  process.stderr.write(`prove-x402 failed: ${(err as Error).message}\n`);
  process.exitCode = 1;
});

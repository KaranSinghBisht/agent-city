/**
 * THE DE-RISK: prove the full delegation spine on-chain before building more.
 *   create principal (Stateless7702) account -> discover relayer capabilities ->
 *   (if needed) sign an EIP-7702 upgrade -> sign a scoped USDC delegation to the
 *   relayer's targetAddress -> redeem a tiny transfer through 1Shot (gas in USDC)
 *   -> poll status to a terminal state.
 *
 * Run: npm run prove   (requires .env: RPC_URL, SIGNER_PRIVATE_KEY; CHAIN selects net)
 * Start on CHAIN=baseSepolia (free, relayer.1shotapi.dev), then CHAIN=base for the
 * 1Shot mainnet prize.
 */
import { parseUnits } from "viem";

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

const log = (message: string): void => {
  process.stdout.write(message + "\n");
};
const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

async function main(): Promise<void> {
  const { chainId, relayerUrl, isTestnet } = resolveChain(config.chainName);
  log(
    `Chain ${config.chainName} (${chainId}) · relayer ${relayerUrl} · ${isTestnet ? "TESTNET" : "MAINNET"}`,
  );

  const { account, owner, client } = await createPrincipalAccount();
  log(`Principal (Stateless7702) smart account: ${account.address}`);

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
  log(
    `targetAddress ${chainCaps.targetAddress} · feeCollector ${chainCaps.feeCollector} · ` +
      `token ${usdc.symbol ?? usdc.address} (${usdc.decimals} dp)`,
  );

  let authorization;
  if (!(await isUpgraded(client, owner.address, Number(chainId)))) {
    authorization = await buildUpgradeAuthorization(
      owner,
      client,
      Number(chainId),
    );
    log(
      "EOA not upgraded — including an EIP-7702 authorization to upgrade via the relayer.",
    );
  } else {
    log("EOA already upgraded to the 7702 stateless delegator.");
  }

  const executor = new DelegatedExecutor({
    relayer,
    chainId,
    resolveContext: signingResolver(account),
    authorization,
  });

  const amount = parseUnits("0.1", Number(usdc.decimals)).toString();
  log(
    `Redeeming a 0.1 ${usdc.symbol ?? "token"} transfer to self via 1Shot...`,
  );
  const result = await executor.execute({
    kind: "transfer",
    to: owner.address,
    token: usdc.address,
    amount,
    reason: "prove-delegation",
  });
  log(`Execute result: ${JSON.stringify(result)}`);

  if (!result.ok || !result.taskId) {
    process.exitCode = 1;
    return;
  }

  for (let i = 0; i < 100; i += 1) {
    const status = await relayer.getStatus(result.taskId as `0x${string}`);
    log(`status ${status.status}${status.hash ? ` · tx ${status.hash}` : ""}`);
    if (status.status === 200) {
      log("✅ Confirmed on-chain.");
      return;
    }
    if (status.status === 400 || status.status === 500) {
      log(
        `❌ Terminal failure (${status.status}): ${status.message ?? JSON.stringify(status.data ?? "")}`,
      );
      process.exitCode = 1;
      return;
    }
    await sleep(3000);
  }
  log("⏱️  Timed out waiting for a terminal status (still pending).");
}

main().catch((err: unknown) => {
  process.stderr.write(`prove-delegation failed: ${(err as Error).message}\n`);
  process.exitCode = 1;
});

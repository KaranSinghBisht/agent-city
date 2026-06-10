/**
 * ERC-7715 GRANT-BRIDGE PROOF: redeem under a granted permission context, on-chain.
 *
 * MetaMask Advanced Permissions returns a hex `context` — the ABI-encoded signed
 * delegation chain (scope `erc20-token-periodic`). Granting interactively needs
 * Flask, so this script synthesizes a grant in EXACTLY that wire format:
 *
 *   "user" (the funded principal, a 7702 smart account) signs an
 *   Erc20PeriodTransfer delegation → city agent, encoded with the Kit's
 *   `encodeDelegations` — byte-identical to a PermissionResponse.context.
 *
 * It then runs the SAME code path the web app uses for a real browser grant:
 *   parseGrant (validate + decodeDelegations) → the agent chains a narrower
 *   sub-budget UNDER the grant → 1Shot redeems [leaf, grant] on-chain.
 *
 * What this proves: the grant wire format decodes, the periodic enforcer accepts
 * the spend, and redemption-under-grant settles via 1Shot. What it does not
 * prove: the interactive Flask popup itself (same context shape, user-signed).
 *
 * Run: npm run prove:grant   (requires .env: RPC_URL, SIGNER_PRIVATE_KEY)
 */
import { parseUnits } from "viem";
import { generatePrivateKey } from "viem/accounts";

import { createDelegation, ScopeType } from "@metamask/smart-accounts-kit";
import { encodeDelegations } from "@metamask/smart-accounts-kit/utils";

import { resolveChain } from "../src/chains.js";
import { config } from "../src/config.js";
import { randomSalt } from "../src/delegation/delegation.js";
import {
  DelegatedExecutor,
  staticResolver,
} from "../src/delegation/executor.js";
import { parseGrant } from "../src/delegation/grantBridge.js";
import {
  toPermissionContext,
  type SignedDelegation,
} from "../src/delegation/redeem.js";
import { buildRedelegation } from "../src/delegation/redelegate.js";
import {
  buildUpgradeAuthorization,
  createPrincipalAccount,
  createSmartAccountFromKey,
  isUpgraded,
} from "../src/delegation/smartAccount.js";
import { OneShotRelayer } from "../src/relayer.js";

const log = (message: string): void => {
  process.stdout.write(message + "\n");
};
const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

async function pollStatus(
  relayer: OneShotRelayer,
  taskId: `0x${string}`,
): Promise<void> {
  for (let i = 0; i < 100; i += 1) {
    const status = await relayer.getStatus(taskId);
    const hash =
      status.hash ??
      (status.receipt as { transactionHash?: string } | undefined)
        ?.transactionHash;
    log(`status ${status.status}${hash ? ` · tx ${hash}` : ""}`);
    if (status.status === 200) {
      log("✅ Confirmed on-chain — redeemed UNDER the granted 7715 context.");
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

async function main(): Promise<void> {
  const { chainId, relayerUrl, isTestnet } = resolveChain(config.chainName);
  log(
    `Chain ${config.chainName} (${chainId}) · relayer ${relayerUrl} · ${isTestnet ? "TESTNET" : "MAINNET"}`,
  );

  const user = await createPrincipalAccount(); // plays the granting wallet
  log(`Granting wallet (root delegator): ${user.account.address}`);
  if (!(await isUpgraded(user.client, user.owner.address, Number(chainId)))) {
    throw new Error(
      "granting wallet is not 7702-upgraded — run `npm run prove` once first; " +
        "this run needs the single 7702 slot for the fresh city agent.",
    );
  }
  log("Granting wallet already 7702-upgraded ✓.");

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
  log(
    `targetAddress ${chainCaps.targetAddress} · token ${usdc.symbol ?? usdc.address} (${dp} dp)`,
  );

  // The city agent the permission is granted TO (fresh — spends the 7702 slot).
  const agent = await createSmartAccountFromKey(generatePrivateKey());
  log(`City agent (grantee): ${agent.account.address}`);

  // 1) The "MetaMask popup": an erc20-token-periodic grant, ≤5 USDC / day.
  const grant = createDelegation({
    to: agent.account.address,
    from: user.account.address,
    environment: user.account.environment,
    salt: randomSalt(),
    scope: {
      type: ScopeType.Erc20PeriodTransfer,
      tokenAddress: usdc.address,
      periodAmount: parseUnits("5", dp),
      periodDuration: 86_400,
      startDate: Math.floor(Date.now() / 1000) - 60,
    },
  });
  const grantSig = await user.account.signDelegation({ delegation: grant });
  const grantSigned = { ...grant, signature: grantSig } as SignedDelegation;
  // The exact wire format a PermissionResponse.context carries.
  const contextHex = encodeDelegations([grantSigned]);
  log(`Granted context (hex, ${contextHex.length} chars) — MetaMask wire format.`);

  // 2) The SAME boundary the web app uses for a real browser grant.
  const parsed = parseGrant(
    { granted: [{ context: contextHex }] },
    agent.account.address,
  );
  log(
    `parseGrant ✓ — ${parsed.chain.length}-link chain, delegator ${parsed.delegator}.`,
  );

  // 3) The agent chains a NARROWER sub-budget under the grant for the relayer.
  const leaf = buildRedelegation({
    environment: agent.account.environment,
    manager: agent.account.address,
    worker: chainCaps.targetAddress,
    token: usdc.address,
    maxAmount: parseUnits("0.3", dp),
    parent: parsed.chain[0] as SignedDelegation,
  });
  const leafSig = await agent.account.signDelegation({ delegation: leaf });
  const leafSigned = { ...leaf, signature: leafSig } as SignedDelegation;
  const context = toPermissionContext([leafSigned, ...parsed.chain]);
  log(
    "Signed chain: user →(≤5 USDC/day, periodic)→ agent →(≤0.3 USDC)→ relayer.",
  );

  const agentAuth = await buildUpgradeAuthorization(
    agent.owner,
    agent.client,
    Number(chainId),
  );
  const executor = new DelegatedExecutor({
    relayer,
    chainId,
    resolveContext: staticResolver(context),
    authorization: agentAuth,
  });

  const amount = parseUnits("0.05", dp).toString();
  log("Redeeming a 0.05 USDC transfer under the granted periodic budget...");
  const result = await executor.execute({
    kind: "transfer",
    to: user.account.address,
    token: usdc.address,
    amount,
    reason: "prove-grant-7715-bridge",
  });
  log(`Execute result: ${JSON.stringify(result)}`);

  if (!result.ok || !result.taskId) {
    process.exitCode = 1;
    return;
  }
  await pollStatus(relayer, result.taskId as `0x${string}`);
}

main().catch((err: unknown) => {
  process.stderr.write(`prove-grant failed: ${(err as Error).message}\n`);
  process.exitCode = 1;
});

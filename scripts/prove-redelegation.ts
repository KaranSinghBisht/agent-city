/**
 * A2A PROOF: a redelegation chain redeemed on-chain via the 1Shot relayer.
 *
 *   principal (already 7702-upgraded) --budget ≤1 USDC--> manager
 *   manager                          --redelegate ≤0.5 USDC--> relayer.targetAddress
 *
 * The manager re-delegates a NARROWER USDC cap under the principal's budget; the
 * relayer redeems the 2-link chain. The child chains to the parent via
 * `authority = hashDelegation(parent)`, so the spend is bounded by BOTH caps —
 * that chain IS the agent-to-agent coordination primitive (Best A2A Coordination).
 *
 * 7702: the relayer accepts only ONE `authorizationList` entry per request, so the
 * principal MUST already be upgraded (run `npm run prove` once first) and the single
 * slot is spent upgrading the fresh manager. Neither manager funds nor manager gas
 * are needed — the manager only SIGNS (auth + delegation); tokens move from the
 * principal (the root delegator) and gas is paid in USDC from the principal's fee leg.
 *
 * Run: npm run prove:a2a   (requires .env: RPC_URL, SIGNER_PRIVATE_KEY; CHAIN selects net)
 */
import { parseUnits } from "viem";
import { generatePrivateKey } from "viem/accounts";

import { resolveChain } from "../src/chains.js";
import { config } from "../src/config.js";
import { buildBudgetDelegation } from "../src/delegation/delegation.js";
import {
  DelegatedExecutor,
  staticResolver,
} from "../src/delegation/executor.js";
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

type SmartAccount = Awaited<ReturnType<typeof createSmartAccountFromKey>>;

const log = (message: string): void => {
  process.stdout.write(message + "\n");
};
const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

/** Sign the 2-link chain principal -> manager -> targetAddress and JSON-encode it. */
async function buildA2AContext(opts: {
  principal: SmartAccount;
  manager: SmartAccount;
  token: `0x${string}`;
  targetAddress: `0x${string}`;
  parentCap: bigint;
  childCap: bigint;
}): Promise<unknown[]> {
  const { principal, manager, token, targetAddress, parentCap, childCap } = opts;

  // Root: principal grants the manager a USDC budget.
  const root = buildBudgetDelegation({
    environment: principal.account.environment,
    from: principal.account.address,
    to: manager.account.address,
    token,
    maxAmount: parentCap,
  });
  const rootSig = await principal.account.signDelegation({ delegation: root });
  const rootSigned = { ...root, signature: rootSig } as SignedDelegation;

  // Redelegation: manager re-delegates a narrower cap to the relayer's delegate.
  const child = buildRedelegation({
    environment: manager.account.environment,
    manager: manager.account.address,
    worker: targetAddress,
    token,
    maxAmount: childCap,
    parent: rootSigned,
  });
  const childSig = await manager.account.signDelegation({ delegation: child });
  const childSigned = { ...child, signature: childSig } as SignedDelegation;

  // Chain order is [leaf, …, root] for redemption.
  return toPermissionContext([childSigned, rootSigned]);
}

async function pollStatus(
  relayer: OneShotRelayer,
  taskId: `0x${string}`,
): Promise<void> {
  for (let i = 0; i < 100; i += 1) {
    const status = await relayer.getStatus(taskId);
    log(`status ${status.status}${status.hash ? ` · tx ${status.hash}` : ""}`);
    if (status.status === 200) {
      log("✅ Confirmed on-chain — redelegation chain redeemed (A2A).");
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

  const principal = await createPrincipalAccount();
  log(`Principal (root delegator): ${principal.account.address}`);

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

  // The relayer allows ONE 7702 upgrade per request — reserve it for the manager.
  if (!(await isUpgraded(principal.client, principal.owner.address, Number(chainId)))) {
    throw new Error(
      "principal EOA is not 7702-upgraded — run `npm run prove` once first; " +
        "the A2A run needs the single 7702 slot for the fresh manager.",
    );
  }
  log("Principal already 7702-upgraded ✓ (no auth slot needed for it).");

  const manager = await createSmartAccountFromKey(generatePrivateKey());
  log(`Manager (sub-delegator, fresh EOA): ${manager.account.address}`);
  const managerAuth = await buildUpgradeAuthorization(
    manager.owner,
    manager.client,
    Number(chainId),
  );
  log("Built the manager's EIP-7702 upgrade authorization (the one allowed slot).");

  const dp = Number(usdc.decimals);
  const context = await buildA2AContext({
    principal,
    manager,
    token: usdc.address,
    targetAddress: chainCaps.targetAddress,
    parentCap: parseUnits("1", dp), // principal → manager: ≤ 1 USDC
    childCap: parseUnits("0.5", dp), // manager → relayer: ≤ 0.5 USDC (narrower)
  });
  log("Signed 2-link chain: principal →(≤1 USDC)→ manager →(≤0.5 USDC)→ relayer.");

  const executor = new DelegatedExecutor({
    relayer,
    chainId,
    resolveContext: staticResolver(context),
    authorization: managerAuth,
  });

  const amount = parseUnits("0.1", dp).toString();
  log(
    `Redeeming a 0.1 ${usdc.symbol ?? "token"} transfer (under both caps) via 1Shot...`,
  );
  const result = await executor.execute({
    kind: "transfer",
    to: principal.account.address,
    token: usdc.address,
    amount,
    reason: "prove-redelegation-a2a",
  });
  log(`Execute result: ${JSON.stringify(result)}`);

  if (!result.ok || !result.taskId) {
    process.exitCode = 1;
    return;
  }
  await pollStatus(relayer, result.taskId as `0x${string}`);
}

main().catch((err: unknown) => {
  process.stderr.write(`prove-redelegation failed: ${(err as Error).message}\n`);
  process.exitCode = 1;
});

/**
 * Live composition root: wires the proven halves of the spine into one runnable
 * Steward. Reads the treasury balance THROUGH Venice Crypto-RPC (so Venice is a
 * core, multi-endpoint dependency), reasons with the private Venice model, and on
 * approval redeems on-chain via the 1Shot relayer (gas in USDC, 7702 upgrade).
 *
 * Used by `npm run demo` (headless) and the web demo server.
 */
import { formatUnits } from "viem";

import type { Policy } from "./agent/policy.js";
import { resolveChain } from "./chains.js";
import { config } from "./config.js";
import {
  DelegatedExecutor,
  signingResolver,
  type SigningAccount,
} from "./delegation/executor.js";
import {
  buildUpgradeAuthorization,
  createPrincipalAccount,
  isUpgraded,
} from "./delegation/smartAccount.js";
import { OneShotRelayer } from "./relayer.js";
import { VeniceReasoner } from "./venice.js";
import { VeniceCryptoRpc, veniceNetworkFor } from "./veniceRpc.js";

export interface LiveSteward {
  account: Awaited<ReturnType<typeof createPrincipalAccount>>["account"];
  owner: Awaited<ReturnType<typeof createPrincipalAccount>>["owner"];
  relayer: OneShotRelayer;
  executor: DelegatedExecutor;
  reasoner: VeniceReasoner;
  policy: Policy;
  token: `0x${string}`;
  tokenSymbol: string;
  tokenDecimals: number;
  /** Reads live on-chain treasury state through Venice Crypto-RPC for the agent's context. */
  onchainContext(): Promise<string>;
}

export async function createLiveSteward(): Promise<LiveSteward> {
  const chain = resolveChain(config.chainName);
  const { account, owner, client } = await createPrincipalAccount();

  const relayer = new OneShotRelayer(chain.relayerUrl);
  const caps = await relayer.getCapabilities([chain.chainId]);
  const chainCaps = caps[chain.chainId];
  if (!chainCaps)
    throw new Error(`relayer has no capabilities for chain ${chain.chainId}`);
  const token =
    chainCaps.tokens.find((t) => t.symbol?.toUpperCase() === "USDC") ??
    chainCaps.tokens[0];
  if (!token)
    throw new Error("relayer advertises no payment tokens on this chain");
  const tokenDecimals = Number(token.decimals);
  const tokenSymbol = token.symbol ?? "USDC";
  const tokenAddress = token.address;

  const authorization = (await isUpgraded(
    client,
    owner.address,
    Number(chain.chainId),
  ))
    ? undefined
    : await buildUpgradeAuthorization(owner, client, Number(chain.chainId));

  const executor = new DelegatedExecutor({
    relayer,
    chainId: chain.chainId,
    resolveContext: signingResolver(account as unknown as SigningAccount),
    authorization,
  });

  const veniceRpc = new VeniceCryptoRpc(
    veniceNetworkFor(config.chainName),
    config.veniceApiKey(),
  );

  const policy: Policy = {
    token: tokenAddress,
    maxPerTx: 1_000_000n, // 1 USDC hard cap per tx
    maxPerDay: 5_000_000n, // 5 USDC/day
    allowedTargets: new Set([owner.address.toLowerCase()]), // demo: settle to self
  };

  async function onchainContext(): Promise<string> {
    const bal = await veniceRpc.erc20Balance(tokenAddress, account.address);
    return (
      `On-chain state (read live through Venice Crypto-RPC): the treasury smart account ` +
      `${account.address} holds ${formatUnits(bal, tokenDecimals)} ${tokenSymbol} on ${config.chainName}. ` +
      `The spend token is ${tokenAddress} (${tokenDecimals} decimals). Allowed payee: ${owner.address}.`
    );
  }

  return {
    account,
    owner,
    relayer,
    executor,
    reasoner: new VeniceReasoner(),
    policy,
    token: token.address,
    tokenSymbol,
    tokenDecimals,
    onchainContext,
  };
}

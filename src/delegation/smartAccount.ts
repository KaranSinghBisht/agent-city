/**
 * The principal's MetaMask smart account for the 1Shot relayer flow: a
 * `Stateless7702` delegator built from a (testnet) signer. EIP-7702 upgrades the
 * EOA *in place*, so the smart account address == the EOA address. The account is
 * the delegator — it grants the relayer a scoped, revocable budget.
 */
import {
  getSmartAccountsEnvironment,
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/smart-accounts-kit";
import { createPublicClient, getAddress, http, type PublicClient } from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";

import { resolveChain } from "../chains.js";
import { config } from "../config.js";
import type { AuthorizationListEntry } from "../relayer.js";

/** Build a Stateless7702 smart account from any (testnet) private key. */
export async function createSmartAccountFromKey(privateKey: `0x${string}`) {
  const { chain } = resolveChain(config.chainName);
  const client = createPublicClient({
    chain,
    transport: http(config.rpcUrl()),
  });
  const owner = privateKeyToAccount(privateKey);

  const account = await toMetaMaskSmartAccount({
    client,
    implementation: Implementation.Stateless7702,
    address: owner.address, // 7702 upgrades the EOA in place
    signer: { account: owner },
  });

  return { client, owner, account };
}

/** The principal (treasury) smart account, from the configured signer key. */
export async function createPrincipalAccount() {
  return createSmartAccountFromKey(config.signerPrivateKey() as `0x${string}`);
}

/** The 7702 stateless delegator implementation address for a chain. */
function impl7702(chainId: number): `0x${string}` {
  const env = getSmartAccountsEnvironment(chainId);
  const impls = env.implementations as Record<string, string | undefined>;
  const addr = impls.EIP7702StatelessDeleGatorImpl;
  if (!addr) {
    throw new Error(
      `no EIP7702StatelessDeleGatorImpl in environment for chain ${chainId}`,
    );
  }
  return getAddress(addr);
}

/** True if the EOA is already EIP-7702-delegated to the 7702 stateless delegator. */
export async function isUpgraded(
  client: PublicClient,
  address: `0x${string}`,
  chainId: number,
): Promise<boolean> {
  const code = await client.getCode({ address });
  if (!code || code === "0x") return false;
  // 7702-delegated code is `0xef0100 || implementation address`.
  return (
    code.toLowerCase() === `0xef0100${impl7702(chainId).slice(2).toLowerCase()}`
  );
}

/**
 * Build the EIP-7702 authorization that upgrades the EOA to a smart account.
 * The relayer accepts at most one `authorizationList` entry per request.
 */
export async function buildUpgradeAuthorization(
  owner: PrivateKeyAccount,
  client: PublicClient,
  chainId: number,
): Promise<AuthorizationListEntry> {
  const nonce = await client.getTransactionCount({
    address: owner.address,
    blockTag: "pending",
  });
  const auth = await owner.signAuthorization({
    chainId,
    contractAddress: impl7702(chainId),
    nonce,
  });
  return {
    address: auth.address,
    chainId: auth.chainId,
    nonce: auth.nonce,
    r: auth.r,
    s: auth.s,
    yParity: auth.yParity ?? 0,
  };
}

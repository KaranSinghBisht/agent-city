/**
 * Chain configuration for the 1Shot permissionless relayer flow.
 *
 * The relayer is split across two hosts by network:
 *   - mainnets -> https://relayer.1shotapi.com/relayers
 *   - testnets -> https://relayer.1shotapi.dev/relayers   (Sepolia, Base Sepolia)
 *
 * `relayer_getCapabilities` is the authoritative source for the accepted payment
 * token, `feeCollector`, and `targetAddress` on each chain; the `usdc` here is a
 * sensible default for the agent's *spending* token and for display.
 */
import type { Chain } from "viem";
import { base, baseSepolia, sepolia } from "viem/chains";

const MAINNET_RELAYER = "https://relayer.1shotapi.com/relayers";
const TESTNET_RELAYER = "https://relayer.1shotapi.dev/relayers";

export interface ChainConfig {
  chain: Chain;
  chainId: string;
  /** Circle USDC on this network (agent spending token; verify via capabilities). */
  usdc: `0x${string}`;
  /** 1Shot relayer JSON-RPC endpoint for this network. */
  relayerUrl: string;
  /** Venice crypto-rpc network slug (for reading the chain through Venice). */
  veniceNetwork: string;
  isTestnet: boolean;
}

export const CHAINS: Record<string, ChainConfig> = {
  base: {
    chain: base,
    chainId: "8453",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    relayerUrl: MAINNET_RELAYER,
    veniceNetwork: "base-mainnet",
    isTestnet: false,
  },
  baseSepolia: {
    chain: baseSepolia,
    chainId: "84532",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    relayerUrl: TESTNET_RELAYER,
    veniceNetwork: "base-sepolia",
    isTestnet: true,
  },
  sepolia: {
    chain: sepolia,
    chainId: "11155111",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    relayerUrl: TESTNET_RELAYER,
    veniceNetwork: "ethereum-sepolia",
    isTestnet: true,
  },
};

export function resolveChain(name: string): ChainConfig {
  const cfg = CHAINS[name];
  if (!cfg) {
    throw new Error(`Unknown chain '${name}'. Options: ${Object.keys(CHAINS).join(", ")}`);
  }
  return cfg;
}

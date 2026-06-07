/**
 * Venice Crypto RPC — read on-chain state THROUGH Venice's pay-per-call JSON-RPC
 * proxy (`POST /crypto/rpc/{network}`, Bearer auth). Reading the chain via Venice
 * (rather than a separate RPC) is what makes Venice a *core, multi-endpoint* part
 * of the agent — the Venice track explicitly rewards combining Venice with
 * on-chain data. The fetcher is injected so this is unit-tested without network.
 */
import { decodeFunctionResult, encodeFunctionData, erc20Abi } from "viem";

import { resolveChain } from "./chains.js";
import { config } from "./config.js";

/** Map our chain name to a Venice crypto-rpc network slug. */
export function veniceNetworkFor(chainName: string): string {
  return resolveChain(chainName).veniceNetwork;
}

type Fetcher = typeof fetch;

interface JsonRpcResponse<T> {
  result?: T;
  error?: { code?: number; message: string };
}

export class VeniceCryptoRpc {
  constructor(
    private readonly network: string,
    private readonly apiKey: string,
    private readonly baseUrl: string = config.veniceBaseUrl,
    private readonly fetcher: Fetcher = fetch,
  ) {}

  async rpc<T>(method: string, params: unknown[]): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}/crypto/rpc/${this.network}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    if (!response.ok) {
      throw new Error(`venice crypto-rpc HTTP ${response.status}`);
    }
    const body = (await response.json()) as JsonRpcResponse<T>;
    if (body.error) {
      throw new Error(`venice crypto-rpc error: ${body.error.message}`);
    }
    if (body.result === undefined) {
      throw new Error("venice crypto-rpc returned no result");
    }
    return body.result;
  }

  /** Read an ERC-20 balance (e.g. the principal's USDC) through Venice. */
  async erc20Balance(token: `0x${string}`, account: `0x${string}`): Promise<bigint> {
    const data = encodeFunctionData({ abi: erc20Abi, functionName: "balanceOf", args: [account] });
    const hex = await this.rpc<`0x${string}`>("eth_call", [{ to: token, data }, "latest"]);
    return decodeFunctionResult({ abi: erc20Abi, functionName: "balanceOf", data: hex }) as bigint;
  }

  /** Native (ETH) balance in wei, through Venice. */
  async nativeBalance(account: `0x${string}`): Promise<bigint> {
    const hex = await this.rpc<`0x${string}`>("eth_getBalance", [account, "latest"]);
    return BigInt(hex);
  }
}

/** Build a VeniceCryptoRpc for the configured chain using the env API key. */
export function createVeniceCryptoRpc(chainName: string = config.chainName): VeniceCryptoRpc {
  return new VeniceCryptoRpc(veniceNetworkFor(chainName), config.veniceApiKey());
}

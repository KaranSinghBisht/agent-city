import { describe, expect, it } from "vitest";

import { VeniceCryptoRpc, veniceNetworkFor } from "./veniceRpc.js";

function fakeFetch(captured: { url?: string; auth?: string; body?: { method?: string } }, result: unknown) {
  return async (url: string | URL | Request, init?: RequestInit) => {
    captured.url = String(url);
    captured.auth = new Headers(init?.headers).get("authorization") ?? undefined;
    captured.body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
}

describe("veniceNetworkFor", () => {
  it("maps chain names to Venice crypto-rpc network slugs", () => {
    expect(veniceNetworkFor("baseSepolia")).toBe("base-sepolia");
    expect(veniceNetworkFor("base")).toBe("base-mainnet");
  });
});

describe("VeniceCryptoRpc", () => {
  it("POSTs JSON-RPC to /crypto/rpc/{network} with Bearer auth", async () => {
    const cap: { url?: string; auth?: string; body?: { method?: string } } = {};
    const rpc = new VeniceCryptoRpc(
      "base-sepolia",
      "kkey",
      "https://api.venice.ai/api/v1",
      fakeFetch(cap, "0x14a34") as typeof fetch,
    );
    const out = await rpc.rpc<string>("eth_chainId", []);
    expect(cap.url).toBe("https://api.venice.ai/api/v1/crypto/rpc/base-sepolia");
    expect(cap.auth).toBe("Bearer kkey");
    expect(cap.body?.method).toBe("eth_chainId");
    expect(out).toBe("0x14a34");
  });

  it("reads an ERC-20 balance via eth_call and decodes the uint256", async () => {
    const amount = 1_000_000n; // 1 USDC
    const hex = "0x" + amount.toString(16).padStart(64, "0");
    const cap: { url?: string; auth?: string; body?: { method?: string } } = {};
    const rpc = new VeniceCryptoRpc(
      "base-sepolia",
      "k",
      "https://api.venice.ai/api/v1",
      fakeFetch(cap, hex) as typeof fetch,
    );
    const bal = await rpc.erc20Balance(
      "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "0x1111111111111111111111111111111111111111",
    );
    expect(cap.body?.method).toBe("eth_call");
    expect(bal).toBe(amount);
  });
});

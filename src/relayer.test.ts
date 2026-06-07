import { describe, expect, it } from "vitest";

import { OneShotRelayer } from "./relayer.js";

function fakeFetch(captured: { method?: string; params?: unknown }, result: unknown) {
  return async (_url: string | URL | Request, init?: RequestInit) => {
    const parsed = JSON.parse(String(init?.body));
    captured.method = parsed.method;
    captured.params = parsed.params;
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
}

describe("OneShotRelayer", () => {
  it("getCapabilities sends an array of chainIds", async () => {
    const captured: { method?: string; params?: unknown } = {};
    const relayer = new OneShotRelayer(
      "https://relayer.test",
      fakeFetch(captured, { "84532": { tokens: [] } }) as typeof fetch,
    );
    await relayer.getCapabilities(["84532"]);
    expect(captured.method).toBe("relayer_getCapabilities");
    expect(captured.params).toEqual(["84532"]);
  });

  it("estimate posts the bundle object and returns success + signed context", async () => {
    const captured: { method?: string; params?: unknown } = {};
    const result = {
      success: true,
      requiredPaymentAmount: "1500000",
      gasUsed: { "84532": "125000" },
      context: "0xquote",
    };
    const relayer = new OneShotRelayer("https://relayer.test", fakeFetch(captured, result) as typeof fetch);
    const out = await relayer.estimate({
      chainId: "84532",
      transactions: [
        { permissionContext: [{ d: 1 }], executions: [{ target: "0xusdc", value: "0", data: "0x" }] },
      ],
    });
    expect(captured.method).toBe("relayer_estimate7710Transaction");
    expect(out.success).toBe(true);
    expect(out.context).toBe("0xquote");
  });

  it("send returns the TaskId string", async () => {
    const captured: { method?: string; params?: unknown } = {};
    const relayer = new OneShotRelayer("https://relayer.test", fakeFetch(captured, "0xtask") as typeof fetch);
    const id = await relayer.send({ chainId: "84532", transactions: [], context: "0xquote" });
    expect(captured.method).toBe("relayer_send7710Transaction");
    expect(id).toBe("0xtask");
  });

  it("getStatus sends { id, logs } and surfaces JSON-RPC errors explicitly", async () => {
    const captured: { method?: string; params?: unknown } = {};
    const relayer = new OneShotRelayer(
      "https://relayer.test",
      fakeFetch(captured, { id: "0x1", status: 200 }) as typeof fetch,
    );
    await relayer.getStatus("0x1");
    expect(captured.method).toBe("relayer_getStatus");
    expect(captured.params).toEqual({ id: "0x1", logs: true });

    const errFetch = async () =>
      new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: -32000, message: "nope" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    const r2 = new OneShotRelayer("https://relayer.test", errFetch as typeof fetch);
    await expect(r2.getStatus("0x1")).rejects.toThrow(/nope/);
  });
});

import { describe, expect, it } from "vitest";

import { DryRunExecutor } from "../agent/dryRunExecutor.js";
import { X402Client } from "./client.js";
import { DelegatedPayer } from "./payer.js";
import type { Payer, PaymentRequirements } from "./types.js";

const REQ: PaymentRequirements = {
  scheme: "exact",
  network: "base-sepolia",
  maxAmountRequired: "10000",
  asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  payTo: "0x4444444444444444444444444444444444444444",
  resource: "venice/insight",
};

// A fake x402 server: 402 + challenge first, 200 + resource once X-PAYMENT is present.
function x402Server(): typeof fetch {
  const fn = async (_url: string | URL | Request, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (headers.has("X-PAYMENT")) {
      return new Response(JSON.stringify({ data: "premium insight" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ x402Version: 1, accepts: [REQ] }), {
      status: 402,
      headers: { "Content-Type": "application/json" },
    });
  };
  return fn as typeof fetch;
}

describe("x402 layer", () => {
  it("pays on 402 and retries to fetch the resource", async () => {
    const payer = new DelegatedPayer(new DryRunExecutor(), 1_000_000n);
    const client = new X402Client(payer, x402Server());

    const res = await client.fetch("https://venice.x402/insight");

    expect(res.status).toBe(200);
    expect(((await res.json()) as { data: string }).data).toBe("premium insight");
  });

  it("passes through non-402 responses without paying", async () => {
    const ok: typeof fetch = (async () => new Response("hi", { status: 200 })) as typeof fetch;
    const payer: Payer = {
      pay: async () => {
        throw new Error("should not have paid");
      },
    };
    expect((await new X402Client(payer, ok).fetch("https://x")).status).toBe(200);
  });

  it("refuses a payment that exceeds the budget", async () => {
    const payer = new DelegatedPayer(new DryRunExecutor(), 5_000n); // < 10000 required
    await expect(payer.pay(REQ)).rejects.toThrow(/exceeds/);
  });

  it("records the settlement proof from the executor", async () => {
    const payer = new DelegatedPayer(new DryRunExecutor(), 1_000_000n);
    const proof = await payer.pay(REQ);
    expect(proof.network).toBe("base-sepolia");
    expect((proof.payload as { taskId: string }).taskId).toBe("dry-run");
  });
});

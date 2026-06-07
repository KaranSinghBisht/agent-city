import { getSmartAccountsEnvironment } from "@metamask/smart-accounts-kit";
import { describe, expect, it } from "vitest";

import { OneShotRelayer, type Send7710Params } from "../relayer.js";
import { DelegatedExecutor, signingResolver, staticResolver } from "./executor.js";

const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const TARGET = "0x9999999999999999999999999999999999999999" as const;
const FEE_COLLECTOR = "0x8888888888888888888888888888888888888888" as const;
const RECIPIENT = "0x2222222222222222222222222222222222222222" as const;
const FROM = "0x1111111111111111111111111111111111111111" as const;

// Mock only the relayer HTTP; delegation encoding + execution building are real.
function relayerFetch(capture?: { sends: Send7710Params[] }): typeof fetch {
  const fn = async (_url: string | URL | Request, init?: RequestInit) => {
    const { method, params } = JSON.parse(String(init?.body));
    let result: unknown = {};
    if (method === "relayer_getCapabilities") {
      result = {
        "84532": {
          feeCollector: FEE_COLLECTOR,
          targetAddress: TARGET,
          tokens: [{ address: USDC, symbol: "USDC", decimals: 6 }],
        },
      };
    } else if (method === "relayer_estimate7710Transaction") {
      result = { success: true, requiredPaymentAmount: "10000", context: "0xctx" };
    } else if (method === "relayer_send7710Transaction") {
      capture?.sends.push(params as Send7710Params);
      result = "0xtask";
    } else if (method === "relayer_getStatus") {
      result = { id: "0xtask", status: 200 };
    }
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  return fn as typeof fetch;
}

describe("DelegatedExecutor (real execution building + mocked relayer)", () => {
  it("builds fee+work executions, estimates, and sends with the price-lock context", async () => {
    const capture = { sends: [] as Send7710Params[] };
    const relayer = new OneShotRelayer("https://relayer.test", relayerFetch(capture));
    const executor = new DelegatedExecutor({
      relayer,
      chainId: "84532",
      resolveContext: staticResolver([{ granted: true }]),
    });

    const result = await executor.execute({
      kind: "transfer",
      to: RECIPIENT,
      token: USDC,
      amount: "100000",
      reason: "integration",
    });

    expect(result.ok).toBe(true);
    expect(result.taskId).toBe("0xtask");

    const sent = capture.sends[0];
    expect(sent?.context).toBe("0xctx");
    const tx = sent?.transactions[0];
    expect(tx?.executions).toHaveLength(2); // fee transfer + work transfer
    expect(tx?.executions[0]?.target).toBe(USDC);
    expect(tx?.permissionContext).toEqual([{ granted: true }]);
  });

  it("works with the signing resolver (local/script signer path)", async () => {
    const environment = getSmartAccountsEnvironment(84532);
    let signed = 0;
    const account = {
      address: FROM,
      environment,
      signDelegation: async () => {
        signed += 1;
        return "0x" as const;
      },
    };
    const relayer = new OneShotRelayer("https://relayer.test", relayerFetch());
    const executor = new DelegatedExecutor({
      relayer,
      chainId: "84532",
      resolveContext: signingResolver(account),
    });

    const result = await executor.execute({
      kind: "transfer",
      to: RECIPIENT,
      token: USDC,
      amount: "100000",
      reason: "signed",
    });
    expect(result.ok).toBe(true);
    expect(signed).toBeGreaterThan(0);
  });

  it("rejects non-transfer actions in the spine", async () => {
    const relayer = new OneShotRelayer("https://relayer.test", relayerFetch());
    const executor = new DelegatedExecutor({
      relayer,
      chainId: "84532",
      resolveContext: staticResolver([]),
    });
    const result = await executor.execute({ kind: "call", to: RECIPIENT, reason: "x" });
    expect(result.ok).toBe(false);
  });

  it("errors when the token is not accepted by the relayer", async () => {
    const relayer = new OneShotRelayer("https://relayer.test", relayerFetch());
    const executor = new DelegatedExecutor({
      relayer,
      chainId: "84532",
      resolveContext: staticResolver([]),
    });
    const result = await executor.execute({
      kind: "transfer",
      to: RECIPIENT,
      token: "0xdead000000000000000000000000000000000000",
      amount: "1",
      reason: "x",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/does not accept token/);
  });
});

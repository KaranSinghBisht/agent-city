import { describe, expect, it } from "vitest";

import { checkPolicy, type Policy } from "./policy.js";
import type { ProposedAction } from "./types.js";

const policy: Policy = {
  token: "0xusdc",
  maxPerTx: 100n,
  maxPerDay: 250n,
  allowedTargets: new Set(["0xmerchant"]),
};

function transfer(to: string, amount: string, token = "0xusdc"): ProposedAction {
  return { kind: "transfer", to: to as `0x${string}`, token: token as `0x${string}`, amount, reason: "x" };
}

describe("checkPolicy", () => {
  it("allows a within-budget transfer to an allowed target, gated by approval", () => {
    const verdict = checkPolicy(transfer("0xmerchant", "50"), policy, 0n);
    expect(verdict.allowed).toBe(true);
    expect(verdict.requiresApproval).toBe(true);
  });

  it("blocks a target not on the allow list", () => {
    expect(checkPolicy(transfer("0xstranger", "10"), policy, 0n).allowed).toBe(false);
  });

  it("blocks an amount over the per-tx cap", () => {
    expect(checkPolicy(transfer("0xmerchant", "101"), policy, 0n).allowed).toBe(false);
  });

  it("blocks when the daily cap would be exceeded", () => {
    expect(checkPolicy(transfer("0xmerchant", "100"), policy, 200n).allowed).toBe(false);
  });

  it("blocks a token outside the delegated budget", () => {
    expect(checkPolicy(transfer("0xmerchant", "10", "0xdai"), policy, 0n).allowed).toBe(false);
  });

  it("blocks a non-positive amount", () => {
    expect(checkPolicy(transfer("0xmerchant", "0"), policy, 0n).allowed).toBe(false);
  });
});

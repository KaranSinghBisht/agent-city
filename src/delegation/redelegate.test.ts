import { getSmartAccountsEnvironment } from "@metamask/smart-accounts-kit";
import { describe, expect, it } from "vitest";

import { buildBudgetDelegation } from "./delegation.js";
import { toPermissionContext, type SignedDelegation } from "./redeem.js";
import { buildRedelegation } from "./redelegate.js";

const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const PRINCIPAL = "0x1111111111111111111111111111111111111111" as const;
const MANAGER = "0x2222222222222222222222222222222222222222" as const;
const WORKER = "0x3333333333333333333333333333333333333333" as const;

describe("A2A redelegation", () => {
  it("chains principal -> manager -> worker and encodes a 2-link JSON-safe context", () => {
    const environment = getSmartAccountsEnvironment(84532);
    const parent = {
      ...buildBudgetDelegation({ environment, from: PRINCIPAL, to: MANAGER, token: USDC, maxAmount: 1_000_000n }),
      signature: "0x" as const,
    } as SignedDelegation;
    const child = {
      ...buildRedelegation({ environment, manager: MANAGER, worker: WORKER, token: USDC, maxAmount: 250_000n, parent }),
      signature: "0x" as const,
    } as SignedDelegation;

    const ctx = toPermissionContext([child, parent]);
    expect(ctx).toHaveLength(2);
    expect((ctx[0] as { delegate?: string }).delegate?.toLowerCase()).toBe(WORKER.toLowerCase());
    expect((ctx[1] as { delegate?: string }).delegate?.toLowerCase()).toBe(MANAGER.toLowerCase());
  });

  it("the child delegation chains UNDER the parent (non-root authority)", () => {
    const environment = getSmartAccountsEnvironment(84532);
    const parent = buildBudgetDelegation({
      environment,
      from: PRINCIPAL,
      to: MANAGER,
      token: USDC,
      maxAmount: 1_000_000n,
    });
    const child = buildRedelegation({
      environment,
      manager: MANAGER,
      worker: WORKER,
      token: USDC,
      maxAmount: 250_000n,
      parent,
    });
    // A root delegation's authority is the ROOT sentinel; a redelegation's authority
    // is the hash of its parent — so they must differ.
    expect(child.authority).not.toBe(parent.authority);
  });
});

/**
 * Settles an x402 payment as an ERC-7710 delegation redemption: a budgeted
 * transfer of `asset` to the service's `payTo`, executed gaslessly through 1Shot
 * (reusing the same Executor as the treasury flow). The redelegated budget is the
 * cap, so the worker pays autonomously without a human gate — but can never
 * exceed it. This is the "x402 + ERC-7710" thesis in one object.
 */
import type { Executor } from "../agent/planner.js";
import { X402Error } from "./types.js";
import type { Payer, PaymentProof, PaymentRequirements } from "./types.js";

export class DelegatedPayer implements Payer {
  private spent = 0n;

  constructor(
    private readonly executor: Executor,
    private readonly budget: bigint,
  ) {}

  async pay(requirements: PaymentRequirements): Promise<PaymentProof> {
    const amount = BigInt(requirements.maxAmountRequired);
    if (this.spent + amount > this.budget) {
      throw new X402Error(`payment ${amount} exceeds remaining budget ${this.budget - this.spent}`);
    }

    const result = await this.executor.execute({
      kind: "transfer",
      to: requirements.payTo,
      token: requirements.asset,
      amount: amount.toString(),
      reason: `x402 payment (${requirements.resource ?? requirements.network})`,
    });
    if (!result.ok) {
      throw new X402Error(`x402 settlement failed: ${result.error}`);
    }

    this.spent += amount;
    return {
      scheme: requirements.scheme,
      network: requirements.network,
      payload: {
        taskId: result.taskId,
        payTo: requirements.payTo,
        asset: requirements.asset,
        amount: amount.toString(),
      },
    };
  }
}

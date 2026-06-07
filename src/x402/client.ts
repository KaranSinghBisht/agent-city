/**
 * Minimal x402 client: GET a resource; on HTTP 402, pay via the injected Payer
 * and retry with an `X-PAYMENT` proof. The payer enforces the agent's budget,
 * so pay-per-call stays inside the cryptographic limit.
 */
import { X402Error } from "./types.js";
import type { Payer, PaymentRequirements, X402Challenge } from "./types.js";

export function selectRequirement(challenge: X402Challenge): PaymentRequirements {
  const requirement = challenge.accepts?.[0];
  if (!requirement) {
    throw new X402Error("x402 challenge contained no payment requirements");
  }
  return requirement;
}

export class X402Client {
  constructor(
    private readonly payer: Payer,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async fetch(url: string, init?: RequestInit): Promise<Response> {
    const first = await this.fetcher(url, init);
    if (first.status !== 402) return first;

    const challenge = (await first.json()) as X402Challenge;
    const requirement = selectRequirement(challenge);
    const proof = await this.payer.pay(requirement);

    // VERIFY: exact X-PAYMENT payload shape against the x402 facilitator in use.
    const header = Buffer.from(
      JSON.stringify({ x402Version: challenge.x402Version ?? 1, ...proof }),
    ).toString("base64");

    const headers = new Headers(init?.headers);
    headers.set("X-PAYMENT", header);
    return this.fetcher(url, { ...init, headers });
  }
}

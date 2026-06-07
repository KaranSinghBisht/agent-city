/** x402 (HTTP 402 pay-per-call) types. */

export class X402Error extends Error {}

/** One acceptable way to pay, from a server's 402 challenge. */
export interface PaymentRequirements {
  scheme: string; // e.g. "exact"
  network: string; // e.g. "base-sepolia"
  maxAmountRequired: string; // base units
  asset: `0x${string}`; // payment token
  payTo: `0x${string}`; // recipient
  resource?: string;
  description?: string;
}

export interface X402Challenge {
  x402Version: number;
  accepts: PaymentRequirements[];
}

/** Evidence of settlement, encoded into the X-PAYMENT header on retry. */
export interface PaymentProof {
  scheme: string;
  network: string;
  payload: Record<string, unknown>;
}

/** Settles an x402 payment. DelegatedPayer settles via the 7710 delegation + 1Shot. */
export interface Payer {
  pay(requirements: PaymentRequirements): Promise<PaymentProof>;
}

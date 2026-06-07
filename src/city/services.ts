/**
 * The Agent City x402 service market: real HTTP 402 pay-per-call endpoints the
 * worker agents buy from. One in-process Hono server, one paid route per service
 * (each with its own payTo). 402 + challenge first; 200 + the resource once paid.
 * Workers settle the price as an ERC-7710 redemption (see DelegatedPayer).
 */
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import type { PaymentRequirements } from "../x402/types.js";

export interface CityService {
  role: string; // which worker buys it
  service: string; // display name
  url: string; // full URL the worker GETs
  payTo: `0x${string}`; // where the payment lands
  price: bigint;
  data: string; // the resource returned once paid
}

export interface RunningServices {
  services: CityService[];
  close: () => Promise<void>;
}

const DEFS = [
  { role: "Research agent", service: "Market-Data API", path: "/market-data", data: "ETH $3,250 · 24h vol $18.4B · funding +0.011%" },
  { role: "Analyst agent", service: "Sentiment API", path: "/sentiment", data: "risk-on · social momentum +12% · regime bullish" },
];

export function startCityServices(opts: {
  price: bigint;
  network: string;
  asset: `0x${string}`;
}): Promise<RunningServices> {
  const { price, network, asset } = opts;
  const built = DEFS.map((d) => {
    const payTo = privateKeyToAccount(generatePrivateKey()).address;
    const requirement: PaymentRequirements = {
      scheme: "exact",
      network,
      maxAmountRequired: price.toString(),
      asset,
      payTo,
      resource: d.service,
      description: `${d.service} (pay-per-call)`,
    };
    return { ...d, payTo, requirement };
  });

  const app = new Hono();
  for (const s of built) {
    app.get(s.path, (c) =>
      c.req.header("X-PAYMENT")
        ? c.json({ data: s.data })
        : c.json({ x402Version: 1, accepts: [s.requirement] }, 402),
    );
  }

  return new Promise((resolve) => {
    const server = serve({ fetch: app.fetch, port: 0 }, (info) => {
      const base = `http://localhost:${info.port}`;
      resolve({
        services: built.map((s) => ({
          role: s.role,
          service: s.service,
          url: base + s.path,
          payTo: s.payTo,
          price,
          data: s.data,
        })),
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

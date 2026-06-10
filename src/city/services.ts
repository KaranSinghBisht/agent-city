/**
 * The Agent City x402 service market: real HTTP 402 pay-per-call endpoints the
 * worker agents buy from. One in-process Hono server, one paid route per service
 * (each with its own payTo). 402 + challenge first; 200 + the resource once paid.
 * Workers settle the price as an ERC-7710 redemption (see DelegatedPayer).
 *
 * The resources are LIVE, not canned: Market-Data reads the Chainlink ETH/USD
 * feed on Base mainnet through Venice Crypto-RPC at purchase time, and Sentiment
 * is written by the Venice model from that live price. If a live read fails the
 * response is explicitly labelled as a fallback — never silently faked.
 */
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { decodeFunctionResult, encodeFunctionData } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { config } from "../config.js";
import { VeniceReasoner } from "../venice.js";
import { VeniceCryptoRpc } from "../veniceRpc.js";
import type { PaymentRequirements } from "../x402/types.js";

/** Chainlink ETH/USD aggregator on Base mainnet. */
const CHAINLINK_ETH_USD = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70" as const;
const AGGREGATOR_ABI = [
  {
    type: "function",
    name: "latestRoundData",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
  },
] as const;

/** Live ETH/USD from Chainlink on Base mainnet, read through Venice Crypto-RPC. */
async function readEthUsd(): Promise<{ price: number; roundId: bigint }> {
  const rpc = new VeniceCryptoRpc("base-mainnet", config.veniceApiKey());
  const data = encodeFunctionData({
    abi: AGGREGATOR_ABI,
    functionName: "latestRoundData",
  });
  const hex = await rpc.rpc<`0x${string}`>("eth_call", [
    { to: CHAINLINK_ETH_USD, data },
    "latest",
  ]);
  const [roundId, answer] = decodeFunctionResult({
    abi: AGGREGATOR_ABI,
    functionName: "latestRoundData",
    data: hex,
  }) as readonly [bigint, bigint, bigint, bigint, bigint];
  return { price: Number(answer) / 1e8, roundId };
}

const fmtUsd = (n: number): string =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Market-Data API: the live Chainlink price, fetched fresh per purchase. */
async function marketData(): Promise<string> {
  try {
    const { price, roundId } = await readEthUsd();
    return `ETH/USD $${fmtUsd(price)} · Chainlink on Base, round ${roundId.toString()} · read live via Venice Crypto-RPC`;
  } catch {
    // Live read unavailable (e.g. no Venice key) — label it, never fake it.
    return "fallback (live Chainlink read via Venice unavailable right now)";
  }
}

/** Sentiment API: one line written by the Venice model from the live price. */
async function sentiment(): Promise<string> {
  try {
    const { price } = await readEthUsd();
    const venice = new VeniceReasoner();
    const line = await venice.complete([
      {
        role: "system",
        content:
          "You are a market-sentiment wire service. Reply with ONE line " +
          "(max 15 words) of crypto market sentiment grounded ONLY in the " +
          "given live price. No preamble, no quotes.",
      },
      { role: "user", content: `ETH/USD is trading at $${fmtUsd(price)} right now.` },
    ]);
    return `${line.trim().slice(0, 160)} · written live by Venice at ETH/USD $${fmtUsd(price)}`;
  } catch {
    return "fallback (live Venice sentiment unavailable right now)";
  }
}

export interface CityService {
  role: string; // which worker buys it
  service: string; // display name
  url: string; // full URL the worker GETs
  payTo: `0x${string}`; // where the payment lands
  price: bigint;
}

export interface RunningServices {
  services: CityService[];
  close: () => Promise<void>;
}

const DEFS = [
  {
    role: "Research agent",
    service: "Market-Data API",
    path: "/market-data",
    fetchData: marketData,
  },
  {
    role: "Analyst agent",
    service: "Sentiment API",
    path: "/sentiment",
    fetchData: sentiment,
  },
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
    app.get(s.path, async (c) =>
      c.req.header("X-PAYMENT")
        ? c.json({ data: await s.fetchData() })
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
        })),
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

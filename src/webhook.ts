/**
 * 1Shot relayer webhook receiver: verify Ed25519-signed status events against the
 * relayer JWKS so the demo learns tx status by PUSH (sub-second) instead of
 * polling — the 1Shot track explicitly rewards webhooks as the status source.
 *
 * The relayer signs the canonical JSON of the envelope WITHOUT the `signature`
 * field (stable, sorted-key serialization), so we strip it and re-serialize the
 * same way before verifying. `data` is the same shape as relayer_getStatus.
 */
import { createHash } from "node:crypto";

import * as ed from "@noble/ed25519";
import stringify from "safe-stable-stringify";

// @noble/ed25519 v2 needs a synchronous sha512 wired for sync verify (it passes
// one or more byte chunks to concatenate).
ed.etc.sha512Sync = (...messages: Uint8Array[]) =>
  new Uint8Array(
    createHash("sha512")
      .update(Buffer.concat(messages.map((m) => Buffer.from(m))))
      .digest(),
  );

const JWKS_URL = "https://relayer.1shotapi.com/.well-known/jwks.json";
const JWKS_TTL_MS = 10 * 60_000;

export type RelayerStatusCode = 100 | 110 | 200 | 400 | 500;

export interface RelayerWebhook {
  apiVersion: number;
  /** 4 = Submitted (data.status 110), 0 = Confirmed (200), 1 = Failure (500). */
  type: 0 | 1 | 4;
  data: {
    id: string;
    status: RelayerStatusCode;
    hash?: string;
    memo?: string;
    [k: string]: unknown;
  };
  timestamp: number;
  keyId: string;
  signature: string;
}

interface Jwk {
  kty: string;
  crv: string;
  kid: string;
  x: string;
}

function base64urlToBytes(s: string): Uint8Array {
  return new Uint8Array(
    Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64"),
  );
}

export class RelayerWebhookVerifier {
  private cache: { at: number; keys: Map<string, Uint8Array> } | null = null;

  constructor(
    private readonly jwksUrl: string = JWKS_URL,
    private readonly fetcher: typeof fetch = fetch,
    private readonly ttlMs: number = JWKS_TTL_MS,
    private readonly now: () => number = () => Date.now(),
  ) {}

  private async keys(force = false): Promise<Map<string, Uint8Array>> {
    if (!force && this.cache && this.now() - this.cache.at < this.ttlMs) {
      return this.cache.keys;
    }
    const res = await this.fetcher(this.jwksUrl);
    if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
    const { keys } = (await res.json()) as { keys: Jwk[] };
    const map = new Map<string, Uint8Array>();
    for (const k of keys) {
      if (k.kty === "OKP" && k.crv === "Ed25519")
        map.set(k.kid, base64urlToBytes(k.x));
    }
    this.cache = { at: this.now(), keys: map };
    return map;
  }

  /** Verify a webhook envelope's Ed25519 signature over its canonical JSON (sans `signature`). */
  async verify(body: Record<string, unknown>): Promise<boolean> {
    const sig = body.signature;
    const keyId = body.keyId;
    if (typeof sig !== "string" || typeof keyId !== "string") return false;

    let pub = (await this.keys()).get(keyId);
    if (!pub) {
      pub = (await this.keys(true)).get(keyId); // key rotation: force-refresh on miss
      if (!pub) return false;
    }

    const { signature: _omit, ...rest } = body;
    const message = new TextEncoder().encode(stringify(rest) as string);
    try {
      return ed.verify(
        new Uint8Array(Buffer.from(sig, "base64")),
        message,
        pub,
      );
    } catch {
      return false;
    }
  }
}

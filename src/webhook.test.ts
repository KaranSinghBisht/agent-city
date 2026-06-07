import { createHash } from "node:crypto";

import * as ed from "@noble/ed25519";
import stringify from "safe-stable-stringify";
import { describe, expect, it } from "vitest";

import { RelayerWebhookVerifier } from "./webhook.js";

ed.etc.sha512Sync = (...messages: Uint8Array[]) =>
  new Uint8Array(
    createHash("sha512")
      .update(Buffer.concat(messages.map((m) => Buffer.from(m))))
      .digest(),
  );

const PRIV = Uint8Array.from(
  Array.from({ length: 32 }, (_, i) => (i * 7 + 3) % 256),
);
const KID = "relayer-key-1";

function toB64url(b: Uint8Array): string {
  return Buffer.from(b)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function jwksFetch(jwk: unknown): typeof fetch {
  return (async () =>
    new Response(JSON.stringify({ keys: [jwk] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;
}

function signEvent(kidForJwk: string): {
  body: Record<string, unknown>;
  jwk: unknown;
} {
  const pub = ed.getPublicKey(PRIV);
  const envelope = {
    apiVersion: 0,
    type: 0,
    data: { id: "0xtask", status: 200 },
    timestamp: 1_780_000_000,
    keyId: KID,
  };
  const sig = ed.sign(
    new TextEncoder().encode(stringify(envelope) as string),
    PRIV,
  );
  return {
    body: { ...envelope, signature: Buffer.from(sig).toString("base64") },
    jwk: { kty: "OKP", crv: "Ed25519", kid: kidForJwk, x: toB64url(pub) },
  };
}

describe("RelayerWebhookVerifier", () => {
  it("verifies a correctly signed webhook", async () => {
    const { body, jwk } = signEvent(KID);
    const verifier = new RelayerWebhookVerifier(
      "https://jwks.test",
      jwksFetch(jwk),
    );
    expect(await verifier.verify(body)).toBe(true);
  });

  it("rejects a payload tampered after signing", async () => {
    const { body, jwk } = signEvent(KID);
    const tampered = { ...body, data: { id: "0xtask", status: 500 } };
    const verifier = new RelayerWebhookVerifier(
      "https://jwks.test",
      jwksFetch(jwk),
    );
    expect(await verifier.verify(tampered)).toBe(false);
  });

  it("rejects when the keyId is not in the JWKS", async () => {
    const { body, jwk } = signEvent("a-different-kid");
    const verifier = new RelayerWebhookVerifier(
      "https://jwks.test",
      jwksFetch(jwk),
    );
    expect(await verifier.verify(body)).toBe(false);
  });

  it("rejects an envelope missing signature/keyId", async () => {
    const verifier = new RelayerWebhookVerifier(
      "https://jwks.test",
      jwksFetch({}),
    );
    expect(await verifier.verify({ apiVersion: 0, type: 0 })).toBe(false);
  });
});

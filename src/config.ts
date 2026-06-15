/**
 * Environment-driven config. No secrets are ever hardcoded; everything sensitive
 * is read from the process environment (see .env.example).
 */
import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name} (see .env.example)`);
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const config = {
  veniceBaseUrl: optional("VENICE_BASE_URL", "https://api.venice.ai/api/v1"),
  // Current private (zero-data-retention) text model; confirm/override via GET /models/traits.
  veniceModel: optional("VENICE_MODEL", "zai-org-glm-4.7"),
  relayerUrl: optional(
    "ONESHOT_RELAYER_URL",
    "https://relayer.1shotapi.com/relayers",
  ),
  chainName: optional("CHAIN", "baseSepolia"),
  // Public base URL of THIS server, used to tell the relayer where to POST signed
  // status webhooks (push-first settlement). When unset, the orchestrator polls.
  webhookPublicUrl: process.env.WEBHOOK_PUBLIC_URL,
  // Functions: evaluated lazily so the brain/tests never require secrets to load.
  veniceApiKey: (): string => required("VENICE_API_KEY"),
  rpcUrl: (): string => required("RPC_URL"),
  signerPrivateKey: (): string => required("SIGNER_PRIVATE_KEY"),
};

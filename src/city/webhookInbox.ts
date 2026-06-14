/**
 * In-memory cache of VERIFIED 1Shot relayer webhooks. The receiver checks the
 * Ed25519/JWKS signature first, then records the status here; the orchestrator
 * reads it PUSH-first (sub-second) and falls back to polling if no event has
 * arrived. Lives only for the server's lifetime — a live status cache, not
 * durable storage. The 1Shot track explicitly rewards webhooks as the status source.
 */
export interface WebhookStatus {
  status: number;
  hash?: string;
  at: number;
}

export interface WebhookStats {
  verified: number;
  last: { id: string; status: number; at: number } | null;
}

export class WebhookInbox {
  private readonly byTask = new Map<string, WebhookStatus>();
  private verified = 0;
  private last: WebhookStats["last"] = null;

  /** Record a status event for a relayer task (id is case-insensitive). */
  record(id: string, status: number, hash?: string): void {
    const at = Date.now();
    this.byTask.set(id.toLowerCase(), { status, hash, at });
    this.verified += 1;
    this.last = { id, status, at };
  }

  /** PUSH-first lookup used by the orchestrator before it polls. */
  lookup(id: string): WebhookStatus | undefined {
    return this.byTask.get(id.toLowerCase());
  }

  stats(): WebhookStats {
    return { verified: this.verified, last: this.last };
  }
}

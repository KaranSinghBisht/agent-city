import { describe, expect, it } from "vitest";

import { WebhookInbox } from "./webhookInbox.js";

describe("WebhookInbox", () => {
  it("records and looks up a status by task id (case-insensitive)", () => {
    const inbox = new WebhookInbox();
    expect(inbox.lookup("0xABC")).toBeUndefined();
    inbox.record("0xABC", 200, "0xhash");
    const got = inbox.lookup("0xabc");
    expect(got?.status).toBe(200);
    expect(got?.hash).toBe("0xhash");
  });

  it("tracks a verified count and the last event", () => {
    const inbox = new WebhookInbox();
    inbox.record("0x1", 110);
    inbox.record("0x2", 200, "0xh");
    const s = inbox.stats();
    expect(s.verified).toBe(2);
    expect(s.last?.id).toBe("0x2");
    expect(s.last?.status).toBe(200);
  });

  it("starts empty", () => {
    expect(new WebhookInbox().stats()).toEqual({ verified: 0, last: null });
  });
});

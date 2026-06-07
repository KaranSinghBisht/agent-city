/**
 * Venice AI client — private, no-data-retention reasoning via an OpenAI-compatible
 * endpoint. The agent core depends on the `Reasoner` interface (not this class),
 * so it is testable with a fake. The OpenAI client is created lazily so the demo
 * server can boot without a key (it's only needed once a run actually reasons).
 */
import OpenAI from "openai";

import { config } from "./config.js";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface Reasoner {
  complete(messages: ChatMessage[]): Promise<string>;
}

export class VeniceReasoner implements Reasoner {
  private client?: OpenAI;

  constructor(
    private readonly baseURL: string = config.veniceBaseUrl,
    private readonly model: string = config.veniceModel,
  ) {}

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: config.veniceApiKey(),
        baseURL: this.baseURL,
      });
    }
    return this.client;
  }

  async complete(messages: ChatMessage[]): Promise<string> {
    try {
      // `disable_thinking` (a Venice model-suffix) stops reasoning models from emitting
      // <think> blocks, so the planner reliably gets a single clean JSON reply.
      const response = await this.getClient().chat.completions.create({
        model: `${this.model}:disable_thinking=true`,
        messages,
        temperature: 0.2,
        max_completion_tokens: 1200,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("empty completion");
      return content;
    } catch (err) {
      // Sanitize: never surface the API key or a raw stack trace.
      throw new Error(`Venice request failed: ${(err as Error).name}`);
    }
  }
}

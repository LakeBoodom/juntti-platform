// Singleton Anthropic client — server-only. Never import from browser code.
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (typeof window !== "undefined") {
    throw new Error("getAnthropic() must not be called from client code");
  }
  if (!client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY missing");
    client = new Anthropic({ apiKey: key });
  }
  return client;
}

// Locked-in model per CLAUDE.md — don't change without a product decision.
export const MODEL = "claude-sonnet-4-6";

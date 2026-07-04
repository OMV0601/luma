/**
 * Central config: the Anthropic client and model selection.
 *
 * One shared client instance is used by both agents. The SDK resolves
 * credentials from ANTHROPIC_API_KEY (loaded from server/.env) or from an
 * `ant auth login` profile if no key is set — so `new Anthropic()` stays
 * argument-free on purpose.
 */
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

// Both agents default to Opus 4.8. Overridable per-agent via .env so the
// team can experiment with cost/latency tradeoffs without touching code.
export const ADVERSARY_MODEL = process.env.ADVERSARY_MODEL || "claude-opus-4-8";
export const REFEREE_MODEL = process.env.REFEREE_MODEL || "claude-opus-4-8";

export const PORT = Number(process.env.PORT) || 3001;

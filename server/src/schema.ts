/**
 * Drizzle schema — SQLite. JSON payloads (playbooks, breakdowns) live in
 * text columns with { mode: "json" }. Swapping to Postgres later is a
 * dialect change, not a redesign.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  isGuest: integer("is_guest", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const scenarios = sqliteTable("scenarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(), // payday | fraudcall | lease
  title: text("title").notNull(),
  setup: text("setup").notNull(), // scene-intro card text
  adversaryName: text("adversary_name").notNull(),
  avatar: text("avatar").notNull(), // emoji mugshot
  persona: text("persona").notNull(),
  playbook: text("playbook", { mode: "json" }).notNull(),
  difficulty: text("difficulty").notNull(),
  supportsVoice: integer("supports_voice", { mode: "boolean" }).notNull().default(false),
  damageModel: text("damage_model").notNull(), // key into server/damage
  orderIndex: integer("order_index").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  scenarioId: integer("scenario_id").notNull(),
  status: text("status").notNull().default("active"), // active | decided
  decision: text("decision"),
  voiceMode: integer("voice_mode", { mode: "boolean" }).notNull().default(false),
  currentBeat: integer("current_beat").notNull().default(0),
  /** JSON state for the scripted (no-API-key) adversary state machine */
  scriptedState: text("scripted_state", { mode: "json" }),
  rngSeed: integer("rng_seed").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull(),
  role: text("role").notNull(), // adversary | user
  content: text("content").notNull(),
  turnIndex: integer("turn_index").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const flags = sqliteTable("flags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull(),
  messageId: integer("message_id").notNull(),
  tacticId: text("tactic_id").notNull(),
  correct: integer("correct", { mode: "boolean" }), // null until graded
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const findings = sqliteTable("findings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull(),
  tacticId: text("tactic_id").notNull(),
  messageId: integer("message_id"), // message the tactic landed on (nullable if unmatched)
  outcome: text("outcome").notNull(), // caught | resisted | fell_for
  evidenceQuote: text("evidence_quote").notNull(),
  explanation: text("explanation").notNull(),
});

export const results = sqliteTable("results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull().unique(),
  damageDollars: integer("damage_dollars").notNull(), // negative = protected
  breakdown: text("breakdown", { mode: "json" }).notNull(),
  headline: text("headline").notNull(),
  score: integer("score").notNull(), // caught count
  possible: integer("possible").notNull(),
  verdict: text("verdict").notNull(), // case_closed | mark
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const codexUnlocks = sqliteTable("codex_unlocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  tacticId: text("tactic_id").notNull(),
  unlockedAt: integer("unlocked_at", { mode: "timestamp_ms" }).notNull(),
});

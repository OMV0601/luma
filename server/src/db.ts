/**
 * SQLite bootstrap: opens data/foolproof.db, creates tables if missing
 * (plain CREATE TABLE IF NOT EXISTS — no migration tooling needed at this
 * stage), and exports the Drizzle handle.
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "./schema.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "../../data");
fs.mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(path.join(dataDir, "foolproof.db"));
sqlite.pragma("journal_mode = WAL");

sqlite.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  is_guest INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS scenarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  setup TEXT NOT NULL,
  adversary_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  persona TEXT NOT NULL,
  playbook TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  supports_voice INTEGER NOT NULL DEFAULT 0,
  damage_model TEXT NOT NULL,
  order_index INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  scenario_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  decision TEXT,
  voice_mode INTEGER NOT NULL DEFAULT 0,
  current_beat INTEGER NOT NULL DEFAULT 0,
  scripted_state TEXT,
  rng_seed INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  turn_index INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  message_id INTEGER NOT NULL,
  tactic_id TEXT NOT NULL,
  correct INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS findings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  tactic_id TEXT NOT NULL,
  message_id INTEGER,
  outcome TEXT NOT NULL,
  evidence_quote TEXT NOT NULL,
  explanation TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL UNIQUE,
  damage_dollars INTEGER NOT NULL,
  breakdown TEXT NOT NULL,
  headline TEXT NOT NULL,
  score INTEGER NOT NULL,
  possible INTEGER NOT NULL,
  verdict TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS codex_unlocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tactic_id TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL
);
`);

export const db = drizzle(sqlite, { schema });
export { schema };

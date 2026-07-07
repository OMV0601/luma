/**
 * `npm run seed:reset` — wipe every player-generated row (users, rounds,
 * messages, flags, findings, results, codex unlocks) and re-seed the
 * scenarios. One command to a clean judge state before a demo. Safe to run
 * while the dev server is up: WAL mode allows a second writer.
 */
import { db, schema, sqlite } from "../db.ts";
import { seed } from "../seed.ts";

const wiped = [
  schema.codexUnlocks,
  schema.results,
  schema.findings,
  schema.flags,
  schema.messages,
  schema.sessions,
  schema.users,
];

for (const table of wiped) db.delete(table).run();
sqlite.exec("DELETE FROM web_sessions"); // log everyone out too
seed();
console.log("[reset] player data wiped — clean judge state");

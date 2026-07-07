/**
 * Minimal SQLite-backed express-session store. The default MemoryStore
 * forgets every login on server restart — mid-demo, that logs the judge out
 * of their round. ~40 lines over the existing better-sqlite3 handle beats a
 * dependency (the popular store packages hardcode a `sessions` table name,
 * which collides with our rounds table).
 */
import { Store, type SessionData } from "express-session";
import { sqlite } from "./db.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

const stmtGet = sqlite.prepare("SELECT sess FROM web_sessions WHERE sid = ? AND expires_at > ?");
const stmtSet = sqlite.prepare(
  "INSERT INTO web_sessions (sid, sess, expires_at) VALUES (?, ?, ?) " +
    "ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expires_at = excluded.expires_at"
);
const stmtDestroy = sqlite.prepare("DELETE FROM web_sessions WHERE sid = ?");
const stmtSweep = sqlite.prepare("DELETE FROM web_sessions WHERE expires_at <= ?");

export class SqliteSessionStore extends Store {
  constructor() {
    super();
    // Lazy sweep: expired rows cost nothing until there are many of them.
    setInterval(() => stmtSweep.run(Date.now()), 15 * 60 * 1000).unref();
  }

  get(sid: string, cb: (err: unknown, session?: SessionData | null) => void) {
    try {
      const row = stmtGet.get(sid, Date.now()) as { sess: string } | undefined;
      cb(null, row ? (JSON.parse(row.sess) as SessionData) : null);
    } catch (err) {
      cb(err);
    }
  }

  set(sid: string, session: SessionData, cb?: (err?: unknown) => void) {
    try {
      const maxAge = session.cookie?.maxAge ?? 30 * DAY_MS;
      stmtSet.run(sid, JSON.stringify(session), Date.now() + maxAge);
      cb?.();
    } catch (err) {
      cb?.(err);
    }
  }

  destroy(sid: string, cb?: (err?: unknown) => void) {
    try {
      stmtDestroy.run(sid);
      cb?.();
    } catch (err) {
      cb?.(err);
    }
  }

  touch(sid: string, session: SessionData, cb?: (err?: unknown) => void) {
    this.set(sid, session, cb);
  }
}

/**
 * In-memory session store — deliberately simple for the MVP. The interface
 * (get/create/save) is the seam where Postgres/Supabase drops in for
 * production; nothing else in the codebase would change.
 */
import { randomUUID } from "node:crypto";

const sessions = new Map();

export function createSession(scenario) {
  const id = randomUUID();
  const session = {
    id,
    scenarioId: scenario.id,
    status: "active", // active | finished
    createdAt: Date.now(),
    // messages: {role: "adversary"|"user", text, annotations?: [{tacticId, quote, explanation}]}
    messages: [],
    debrief: null,
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id) {
  return sessions.get(id);
}

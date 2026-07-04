/** Thin fetch wrapper for the FoolProof API. */

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export const api = {
  scenarios: () => request("/api/scenarios"),
  scenarioDocument: (id) => request(`/api/scenarios/${id}/document`),
  startSession: (scenarioId) =>
    request("/api/sessions", { method: "POST", body: JSON.stringify({ scenarioId }) }),
  sendMessage: (sessionId, text) =>
    request(`/api/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  decide: (sessionId, decision) =>
    request(`/api/sessions/${sessionId}/decision`, {
      method: "POST",
      body: JSON.stringify({ decision }),
    }),
};

/* ----- lifetime tally (localStorage) ----- */

const TALLY_KEY = "foolproof_tally";

export function readTally() {
  try {
    return JSON.parse(localStorage.getItem(TALLY_KEY)) || { protected: 0, lost: 0, rounds: 0 };
  } catch {
    return { protected: 0, lost: 0, rounds: 0 };
  }
}

export function recordRound(debrief) {
  const t = readTally();
  t.protected += debrief.moneyProtected;
  t.lost += debrief.moneyLost;
  t.rounds += 1;
  localStorage.setItem(TALLY_KEY, JSON.stringify(t));
  return t;
}

export const usd = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

import { useEffect, useState } from "react";
import { api, readTally, usd } from "../api.js";

/** Scenario picker + lifetime tally. */
export default function Home({ onStart }) {
  const [scenarios, setScenarios] = useState(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(null);
  const tally = readTally();

  useEffect(() => {
    api
      .scenarios()
      .then((r) => setScenarios(r.scenarios))
      .catch((e) => setError(e.message));
  }, []);

  async function start(id) {
    setStarting(id);
    setError(null);
    try {
      const session = await api.startSession(id);
      onStart(session);
    } catch (e) {
      setError(e.message);
      setStarting(null);
    }
  }

  return (
    <main className="home">
      <section className="hero">
        <h1>
          Negotiate against AI scammers.
          <br />
          <em>Lose fake money, not real money.</em>
        </h1>
        <p className="hero-sub">
          Each adversary below runs real, documented manipulation tactics. A referee AI
          watches every message — afterwards you'll see exactly which traps you caught,
          which ones got you, and what your mistakes would have cost in real dollars.
        </p>
        {tally.rounds > 0 && (
          <div className="tally">
            <div className="tally-item good">
              <span className="tally-num">{usd(tally.protected)}</span>
              <span className="tally-label">protected</span>
            </div>
            <div className="tally-item bad">
              <span className="tally-num">{usd(tally.lost)}</span>
              <span className="tally-label">lost (simulated)</span>
            </div>
            <div className="tally-item">
              <span className="tally-num">{tally.rounds}</span>
              <span className="tally-label">rounds played</span>
            </div>
          </div>
        )}
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="cards">
        {!scenarios && !error && <div className="loading">Loading scenarios…</div>}
        {scenarios?.map((s) => (
          <article key={s.id} className="card">
            <div className="card-difficulty">{s.difficulty}</div>
            <h2>{s.title}</h2>
            <p className="card-tagline">{s.tagline}</p>
            <p className="card-role">{s.userRole}</p>
            <button
              className="btn primary"
              disabled={starting !== null}
              onClick={() => start(s.id)}
            >
              {starting === s.id ? "Entering…" : `Face ${s.character.split(" — ")[0]}`}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

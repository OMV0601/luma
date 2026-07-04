import { useEffect, useMemo, useRef } from "react";
import { recordRound, usd } from "../api.js";
import { TACTIC_NAMES } from "./tactics.js";

const STATUS_META = {
  neutralized: { label: "NEUTRALIZED", cls: "good", icon: "✅" },
  spotted: { label: "SPOTTED", cls: "warn", icon: "👁" },
  missed: { label: "GOT YOU", cls: "bad", icon: "🪤" },
};

/**
 * The debrief — where the learning happens. Trap verdicts, dollar costs,
 * fair-alternative comparison, coaching, and the annotated transcript replay.
 */
export default function Debrief({ result, scenario, onHome }) {
  const { debrief, transcript } = result;
  const recorded = useRef(false);

  // Record into the lifetime tally exactly once (StrictMode double-mount safe).
  useEffect(() => {
    if (!recorded.current) {
      recorded.current = true;
      recordRound(debrief);
    }
  }, [debrief]);

  const headline = useMemo(() => {
    if (debrief.decision === "walk_away")
      return { text: "You walked away.", sub: `${usd(debrief.moneyProtected)} protected.` };
    if (debrief.moneyLost > 0)
      return {
        text: "You took the deal.",
        sub: `This decision would have cost you ${usd(debrief.moneyLost)}.`,
      };
    return { text: "You took the deal — but on your terms.", sub: "Every trap was neutralized first." };
  }, [debrief]);

  const characterName = scenario.character.split(" — ")[0];

  return (
    <main className="debrief">
      <section className={`verdict ${debrief.decision === "walk_away" || debrief.moneyLost === 0 ? "good" : "bad"}`}>
        <div className="verdict-grade">{debrief.grade}</div>
        <div className="verdict-main">
          <h1>{headline.text}</h1>
          <p className="verdict-sub">{headline.sub}</p>
          <p className="verdict-summary">{debrief.playerSummary}</p>
          <div className="verdict-stats">
            <span>Awareness: <b>{debrief.awareness}/100</b></span>
            <span>Score: <b>{debrief.finalScore}/100</b></span>
            <span>Total exposure: <b>{usd(debrief.totalExposure)}</b></span>
          </div>
        </div>
      </section>

      <section className="traps">
        <h2>The traps</h2>
        <div className="trap-grid">
          {debrief.traps.map((t) => {
            const meta = STATUS_META[t.status];
            return (
              <article key={t.id} className={`trap-card ${meta.cls}`}>
                <div className="trap-status">{meta.icon} {meta.label}</div>
                <h3>{t.label}</h3>
                <div className="trap-tactic">{TACTIC_NAMES[t.tactic]}</div>
                {t.cost > 0 && (
                  <div className="trap-cost">
                    {usd(t.cost)} <span className="trap-cost-label">— {t.costLabel}</span>
                  </div>
                )}
                {t.cost === 0 && <div className="trap-cost zero">{t.costLabel}</div>}
                <p className="trap-explain">{t.explanation}</p>
                {t.evidence && <blockquote className="trap-evidence">"{t.evidence}"</blockquote>}
              </article>
            );
          })}
        </div>
      </section>

      <section className="fair-alt">
        <h2>The fair alternative</h2>
        <div className="fair-card">
          <h3>{debrief.fairAlternative.label}</h3>
          <p>{debrief.fairAlternative.detail}</p>
        </div>
      </section>

      {debrief.coachingTips?.length > 0 && (
        <section className="coaching">
          <h2>Next time</h2>
          <ul>
            {debrief.coachingTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="replay">
        <h2>Replay — every manipulation attempt, labeled</h2>
        <div className="replay-scroll">
          {transcript.map((m, i) => (
            <div key={i} className={`bubble-row ${m.role}`}>
              <div className="bubble">
                {m.role === "adversary" && <div className="bubble-name">{characterName}</div>}
                <div className="bubble-text">{m.text}</div>
                {m.annotations?.length > 0 && (
                  <div className="bubble-tactics">
                    {m.annotations.map((a, j) => (
                      <span key={j} className="tactic-badge" title={`"${a.quote}" — ${a.explanation}`}>
                        ⚠ {TACTIC_NAMES[a.tacticId] || a.tacticId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="debrief-actions">
        <button className="btn primary" onClick={onHome}>Train again</button>
      </div>
    </main>
  );
}

import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, usd } from "../api";
import type { DebriefData, Finding } from "../types";
import { tacticName } from "../../../shared/tactics";
import Stamp from "../components/Stamp";
import CountUp from "../components/CountUp";
import Redaction from "../components/Redaction";
import SealedFile from "../components/SealedFile";
import { SkeletonBlock } from "../components/Skeleton";

const OUTCOME_META = {
  caught: { label: "CAUGHT", cls: "text-verified border-verified" },
  resisted: { label: "RESISTED", cls: "text-amber border-amber" },
  fell_for: { label: "FELL FOR IT", cls: "text-redink border-redink" },
} as const;

function OutcomeChip({ outcome }: { outcome: Finding["outcome"] }) {
  const m = OUTCOME_META[outcome];
  return (
    <span className={`stamp-text text-[10px] font-bold border-2 rounded-sm px-1.5 py-0.5 ${m.cls}`}>
      {m.label}
    </span>
  );
}

export default function Debrief() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ["debrief", sessionId],
    queryFn: () => api.debrief<DebriefData>(sessionId!),
  });

  if (error) return <SealedFile message={(error as Error).message} />;
  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-3xl w-full px-4 py-10 space-y-4">
        <SkeletonBlock className="h-28 w-full" />
        <SkeletonBlock className="h-64 w-full" />
      </div>
    );
  }

  const { result, findings, transcript, flags } = data;
  const protectedRound = result.damageDollars <= 0;
  const counts = {
    caught: findings.filter((f) => f.outcome === "caught").length,
    resisted: findings.filter((f) => f.outcome === "resisted").length,
    fell_for: findings.filter((f) => f.outcome === "fell_for").length,
  };
  const findingsByMessage = new Map<number, Finding[]>();
  for (const f of findings) {
    if (f.messageId == null) continue;
    const arr = findingsByMessage.get(f.messageId) ?? [];
    arr.push(f);
    findingsByMessage.set(f.messageId, arr);
  }
  const unfounded = flags.filter((fl) => fl.correct === false);

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8">
      {/* ---- Case header + damage figure ---- */}
      <div className="paper-card p-5 sm:p-7 relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="stamp-text text-[10px] text-ink/50 font-semibold">
              EVIDENCE FILE №{String(sessionId).padStart(4, "0")} — {data.scenario.title.toUpperCase()}
            </p>
            <p className="font-mono text-xs mt-1 text-ink/60">
              SUBJECT: {data.scenario.adversaryName} · YOUR CALL: {data.decisionLabel}
            </p>
          </div>
          <Stamp verdict={result.verdict} size="lg" />
        </div>

        <div className="mt-6">
          <p className="stamp-text text-[10px] font-semibold text-ink/50">
            {protectedRound ? "MONEY PROTECTED" : "WHAT IT WOULD HAVE COST YOU"}
          </p>
          <div
            className={`font-display text-5xl sm:text-7xl mt-1 ${
              protectedRound ? "text-verified" : "text-redink"
            }`}
          >
            <CountUp value={result.damageDollars} prefix={protectedRound ? "" : "-"} />
          </div>
          <p className="text-sm mt-3 max-w-xl text-ink/80">{result.headline}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <OutcomeChipCount n={counts.caught} outcome="caught" />
          <OutcomeChipCount n={counts.resisted} outcome="resisted" />
          <OutcomeChipCount n={counts.fell_for} outcome="fell_for" />
          {unfounded.length > 0 && (
            <span className="stamp-text text-[10px] font-bold border-2 border-amber text-amber rounded-sm px-1.5 py-0.5 shake">
              {unfounded.length} UNFOUNDED FLAG{unfounded.length > 1 ? "S" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ---- Itemized cost table (with redaction reveals) ---- */}
      <section className="mt-8">
        <h2 className="stamp-text text-sm font-bold">THE ITEMIZED DAMAGE</h2>
        <div className="paper-card mt-3 divide-y-2 divide-ink/15">
          {result.breakdown.map((row, i) => (
            <div key={i} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {row.buried ? <Redaction>{row.label}</Redaction> : row.label}
                </p>
                <p className="text-xs text-ink/60 mt-0.5">
                  {row.buried ? <Redaction>{row.note}</Redaction> : row.note}
                </p>
              </div>
              {row.amount > 0 && (
                <p className={`tabular font-display shrink-0 ${protectedRound ? "text-verified" : "text-redink"}`}>
                  {row.buried ? <Redaction>{usd(row.amount)}</Redaction> : usd(row.amount)}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink/40 mt-2">
          Figures computed by the deterministic damage engine — not by the AI.
        </p>
        {data.verification?.verified && (
          <div className="mt-2 border-2 border-verified rounded-md px-3 py-2 bg-paper-bright flex items-start gap-2">
            <span className="text-verified font-bold" aria-hidden>
              ✓
            </span>
            <div className="min-w-0">
              <p className="stamp-text text-[10px] font-bold text-verified">
                INDEPENDENTLY CROSS-CHECKED — WOLFRAM|ALPHA
              </p>
              <p className="font-mono text-[11px] text-ink/70 mt-0.5 break-words">
                {data.verification.query} ={" "}
                {Math.round(data.verification.expected * 100) / 100} — {data.verification.claim}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ---- Annotated transcript ---- */}
      <section className="mt-8">
        <h2 className="stamp-text text-sm font-bold">THE TAPE — ANNOTATED</h2>
        <div className="paper-card mt-3 p-4 space-y-4">
          {transcript.map((m) => {
            const anns = findingsByMessage.get(m.id) ?? [];
            return m.role === "adversary" ? (
              <div key={m.id} className="sm:grid sm:grid-cols-[9.5rem_1fr] sm:gap-3">
                {/* margin annotations */}
                <div className="mb-1 sm:mb-0 sm:border-r-2 sm:border-redink/30 sm:pr-2 space-y-1">
                  {anns.map((f) => (
                    <div key={f.id} className="font-mono text-[10px] leading-tight text-redink">
                      <span className="font-bold">⚠ {tacticName(f.tacticId).toUpperCase()}</span>
                      <span className="text-ink/50"> — msg {m.turnIndex}</span>
                      <div className="mt-0.5">
                        <OutcomeChip outcome={f.outcome} />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div
                    className={`border-2 rounded-md p-3 bg-paper-bright ${
                      anns.length ? "border-redink/60" : "border-ink/20"
                    }`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-redink/70">
                      {data.scenario.adversaryName}
                    </p>
                    <p className="text-sm mt-1 whitespace-pre-wrap leading-snug">
                      {anns.length ? (
                        <mark className="bg-transparent underline decoration-redink decoration-wavy decoration-1 underline-offset-4 text-ink">
                          {m.content}
                        </mark>
                      ) : (
                        m.content
                      )}
                    </p>
                  </div>
                  {anns.map((f) => (
                    <p key={f.id} className="text-xs text-ink/70 mt-1.5 pl-1">
                      → {f.explanation}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div key={m.id} className="sm:grid sm:grid-cols-[9.5rem_1fr] sm:gap-3">
                <div />
                <div className="border-2 border-ink rounded-md p-3 ml-8 sm:ml-16">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">YOU</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap leading-snug">{m.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- What the pros ask ---- */}
      <section className="mt-8">
        <h2 className="stamp-text text-sm font-bold">WHAT THE PROS ASK</h2>
        <div className="paper-card mt-3 p-4 space-y-3">
          {data.neutralizingQuestions.map((q, i) => (
            <p key={i} className="text-sm border-l-4 border-verified pl-3 leading-snug">
              “{q}”
            </p>
          ))}
        </div>
      </section>

      {/* ---- CTAs ---- */}
      <div className="mt-8 flex flex-wrap gap-3 pb-10">
        <Link to="/gauntlet" className="btn-ink">
          Next case
        </Link>
        <Link to="/profile" className="btn">
          View my Street Smarts
        </Link>
      </div>
    </div>
  );
}

function OutcomeChipCount({ n, outcome }: { n: number; outcome: Finding["outcome"] }) {
  if (n === 0) return null;
  const m = OUTCOME_META[outcome];
  return (
    <span className={`stamp-text text-[10px] font-bold border-2 rounded-sm px-1.5 py-0.5 ${m.cls}`}>
      {n} {m.label}
    </span>
  );
}

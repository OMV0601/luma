import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Me, ScenarioCard } from "../types";
import Redaction from "../components/Redaction";
import { SkeletonCard } from "../components/Skeleton";

/** Decorative evidence stack for the hero — the product's own artifacts,
 *  tilted like they were dropped on a desk. Pure markup, no images. */
function EvidenceStack() {
  return (
    <div className="relative hidden md:block select-none" aria-hidden>
      <div className="paper-card p-4 rotate-[-3deg] max-w-xs">
        <p className="stamp-text text-[10px] font-bold text-ink/50">EXHIBIT A — THE PITCH</p>
        <p className="font-mono text-sm mt-2 leading-snug">
          “Fifteen bucks per hundred. Flat. Simplest math in the business.”
        </p>
        <p className="font-mono text-sm mt-2 font-semibold text-redink">
          <Redaction>= 391.1% APR</Redaction>
        </p>
      </div>
      <div className="paper-card p-4 rotate-[2.5deg] max-w-[15rem] ml-16 -mt-3">
        <span className="stamp-text text-[10px] font-bold text-amber border-2 border-amber rounded-sm px-1.5 py-0.5">
          ⚑ URGENCY PRESSURE
        </span>
        <p className="font-mono text-[11px] mt-2 text-ink/70">
          flagged live, msg 3 —{" "}
          <span className="text-verified font-bold">CAUGHT IN THE ACT</span>
        </p>
      </div>
      <div className="paper-card p-4 rotate-[-1.5deg] max-w-[13rem] ml-6 -mt-2">
        <p className="stamp-text text-[9px] font-semibold text-ink/50">
          WHAT IT WOULD HAVE COST YOU
        </p>
        <p className="font-display text-3xl text-redink mt-1 tabular">-$2,165</p>
        <span className="stamp-text inline-block mt-1 text-[10px] font-bold text-redink border-2 border-redink rounded-sm px-1.5 py-0.5 rotate-[-6deg]">
          MARK
        </span>
      </div>
    </div>
  );
}

export default function Welcome() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api.me<Me>() });
  const { data } = useQuery({
    queryKey: ["scenarios"],
    queryFn: () => api.scenarios<{ scenarios: ScenarioCard[] }>(),
  });
  const [username, setUsername] = useState("");
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enter(e?: React.FormEvent) {
    e?.preventDefault();
    if (me?.user) return nav("/gauntlet");
    if (!asking) return setAsking(true);
    if (!username.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.login(username.trim());
      await qc.invalidateQueries({ queryKey: ["me"] });
      nav("/gauntlet");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl w-full px-4 py-10 md:py-16">
      {/* Hero */}
      <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:gap-10 md:items-center">
      <div className="max-w-2xl">
        <p className="stamp-text text-xs text-redink font-semibold">
          CONSUMER FRAUD TRAINING DIVISION
        </p>
        <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mt-3">
          GET SCAMMED HERE,
          <br />
          SO IT NEVER HAPPENS
          <br />
          OUT THERE.
        </h1>
        <p className="mt-5 text-lg text-ink/80 max-w-xl">
          Americans reported <strong className="text-redink">$15.9 billion</strong> lost to fraud
          last year (FTC) — and that excludes the perfectly legal traps. FoolProof puts you in the
          room with the people who take it: negotiate, catch their tactics in the act, and see
          exactly what every mistake would have cost you.
        </p>

        <form onSubmit={enter} className="mt-7 flex flex-wrap items-center gap-3">
          {asking && !me?.user && (
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Codename (username)"
              maxLength={32}
              className="paper-card shadow-none px-4 py-2 font-mono text-sm w-56"
              aria-label="Username"
            />
          )}
          <button type="submit" className="btn-ink" disabled={busy}>
            {me?.user ? "Enter the Gauntlet" : asking ? "Begin training" : "Enter the Gauntlet"}
          </button>
          {error && <span className="text-redink font-mono text-xs">{error}</span>}
        </form>
      </div>
      <EvidenceStack />
      </div>

      {/* Wanted posters */}
      <div className="mt-12">
        <h2 className="stamp-text text-sm font-semibold text-ink/60">ACTIVE SUBJECTS</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {!data
            ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
            : data.scenarios.map((s) => (
                <article key={s.slug} className="paper-card p-5 relative overflow-hidden">
                  <p className="stamp-text text-[10px] text-redink font-semibold">WANTED</p>
                  <div className="text-5xl mt-2" aria-hidden>
                    {s.avatar}
                  </div>
                  <h3 className="font-display text-xl mt-3">{s.title}</h3>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ink/50 mt-1">
                    {s.difficulty}
                  </p>
                  <p className="text-sm text-ink/75 mt-2 leading-snug">{s.setup}</p>
                </article>
              ))}
        </div>
      </div>

      <p className="mt-10 font-mono text-xs text-ink/50">
        Running a credit union, bank, or classroom?{" "}
        <Link to="/for-institutions" className="underline underline-offset-4 hover:text-ink">
          FoolProof for institutions →
        </Link>
      </p>
    </div>
  );
}

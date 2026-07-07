import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Me, ScenarioCard } from "../types";
import { SkeletonCard } from "../components/Skeleton";

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

      {/* Wanted posters */}
      <div className="mt-12">
        <h2 className="stamp-text text-sm font-semibold text-ink/60">ACTIVE SUBJECTS</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {!data
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
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
    </div>
  );
}

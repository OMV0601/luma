import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Phone } from "lucide-react";
import { api, usd } from "../api";
import type { Me, ScenarioCard } from "../types";
import Stamp from "../components/Stamp";
import { SkeletonCard } from "../components/Skeleton";
import { useEffect } from "react";

export default function Gauntlet() {
  const nav = useNavigate();
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.me<Me>(),
  });
  const { data } = useQuery({
    queryKey: ["scenarios"],
    queryFn: () => api.scenarios<{ scenarios: ScenarioCard[] }>(),
  });

  // Not logged in -> back to the front door.
  useEffect(() => {
    if (!meLoading && me && !me.user) nav("/");
  }, [me, meLoading, nav]);

  return (
    <div className="mx-auto max-w-5xl w-full px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">THE GAUNTLET</h1>
          <p className="font-mono text-xs uppercase tracking-wider text-ink/60 mt-1">
            Pick a subject. Survive the pitch. Open the evidence file.
          </p>
        </div>
        {me?.user && (me.roundsPlayed ?? 0) > 0 && (
          <div className="font-mono text-xs text-right">
            <div className="text-verified">PROTECTED: {usd(me.moneyProtected ?? 0)}</div>
            <div className="text-redink">LOST: {usd(me.moneyLost ?? 0)}</div>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {!data
          ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
          : data.scenarios.map((s) => (
              <article key={s.slug} className="paper-card p-5 flex flex-col relative">
                <div className="absolute top-3 right-3">
                  <Stamp verdict={s.best} size="sm" />
                </div>
                <div className="text-5xl" aria-hidden>
                  {s.avatar}
                </div>
                <h2 className="font-display text-xl mt-3">{s.title}</h2>
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink/50 mt-1">
                  CASE FILE — {s.difficulty}
                </p>
                <p className="text-sm text-ink/75 mt-2 leading-snug flex-1">{s.setup}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Link to={`/round/${s.slug}`} className="btn-ink flex-1 text-center">
                    Open the case
                  </Link>
                  {s.supportsVoice && (
                    <span
                      title="Supports voice mode"
                      className="border-2 border-ink rounded-md p-2"
                      aria-label="Supports voice mode"
                    >
                      <Phone className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </article>
            ))}
      </div>
    </div>
  );
}

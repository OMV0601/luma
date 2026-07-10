import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { api } from "../api";
import type { CodexTactic } from "../types";
import { SkeletonCard } from "../components/Skeleton";

/**
 * The Tactic Codex: all 10 tactics; entries unlock when you meet them in a
 * round — teach at the moment of failure, never a lesson module.
 */
export default function Codex() {
  const { data } = useQuery({
    queryKey: ["codex"],
    queryFn: () => api.codex<{ tactics: CodexTactic[] }>(),
  });

  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-8 pb-14">
      <h1 className="font-display text-3xl">TACTIC CODEX</h1>
      <p className="font-mono text-xs uppercase tracking-wider text-ink/60 mt-1">
        Every con is one of ten moves. Entries unlock when someone runs one on you.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2" data-tour="codex">
        {!data
          ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
          : data.tactics.map((t) =>
              t.unlocked ? (
                <article key={t.id} className="paper-card p-4">
                  <h2 className="stamp-text text-sm font-bold text-redink">
                    ⚠ {t.name.toUpperCase()}
                  </h2>
                  <p className="text-sm mt-2">{t.definition}</p>
                  <p className="text-xs text-ink/70 mt-3">
                    <span className="stamp-text text-[9px] font-bold text-ink/50">IN THE WILD: </span>
                    {t.example}
                  </p>
                  <p className="text-xs mt-2 border-l-4 border-verified pl-2">
                    <span className="stamp-text text-[9px] font-bold text-verified">COUNTER: </span>
                    {t.counter}
                  </p>
                </article>
              ) : (
                <article
                  key={t.id}
                  className="paper-card p-4 opacity-60 flex flex-col items-start"
                >
                  <h2 className="stamp-text text-sm font-bold flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" /> {t.name.toUpperCase()}
                  </h2>
                  <p className="font-mono text-[11px] text-ink/50 mt-2">
                    LOCKED — face this move in a round to open the entry.
                  </p>
                </article>
              )
            )}
      </div>
    </div>
  );
}

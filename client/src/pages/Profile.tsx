import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { api, usd } from "../api";
import type { ProfileData } from "../types";
import Stamp from "../components/Stamp";
import SealedFile from "../components/SealedFile";
import { SkeletonBlock } from "../components/Skeleton";

export default function Profile() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.profile<ProfileData>(),
  });

  // Without this, an expired session leaves the skeleton up forever.
  if (error) return <SealedFile message={(error as Error).message} />;
  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-4xl w-full px-4 py-8 space-y-4">
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-72 w-full" />
      </div>
    );
  }

  const radarData = data.radar.map((r) => ({
    tactic: r.name.split(" ")[0],
    fullName: r.name,
    rate: r.catchRate,
  }));

  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-8 pb-14">
      <h1 className="font-display text-3xl">STREET SMARTS</h1>
      <p className="font-mono text-xs uppercase tracking-wider text-ink/60 mt-1">
        Your file. Your reflexes. Your money.
      </p>

      {/* Tallies */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="paper-card p-4">
          <p className="stamp-text text-[10px] font-semibold text-ink/50">MONEY PROTECTED</p>
          <p className="font-display text-3xl text-verified mt-1 tabular">
            {usd(data.moneyProtected)}
          </p>
        </div>
        <div className="paper-card p-4">
          <p className="stamp-text text-[10px] font-semibold text-ink/50">MONEY LOST (SIMULATED)</p>
          <p className="font-display text-3xl text-redink mt-1 tabular">{usd(data.moneyLost)}</p>
        </div>
        <div className="paper-card p-4">
          <p className="stamp-text text-[10px] font-semibold text-ink/50">ROUNDS PLAYED</p>
          <p className="font-display text-3xl mt-1 tabular">{data.roundsPlayed}</p>
        </div>
      </div>

      {/* Radar */}
      <section className="mt-8" data-tour="radar">
        <h2 className="stamp-text text-sm font-bold">TACTIC CATCH-RATE</h2>
        <div className="paper-card mt-3 p-2 sm:p-4">
          {data.roundsPlayed === 0 ? (
            <p className="p-6 text-sm text-ink/60 font-mono">
              No rounds on file. <Link to="/gauntlet" className="underline">Enter the Gauntlet</Link>{" "}
              to start building your profile.
            </p>
          ) : (
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="#1C1917" strokeOpacity={0.25} />
                  <PolarAngleAxis
                    dataKey="tactic"
                    tick={{ fill: "#1C1917", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="rate"
                    stroke="#C1361B"
                    fill="#C1361B"
                    fillOpacity={0.28}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* History */}
      <section className="mt-8">
        <h2 className="stamp-text text-sm font-bold">CASE HISTORY</h2>
        <div className="paper-card mt-3 divide-y-2 divide-ink/15">
          {data.history.length === 0 && (
            <p className="p-4 text-sm text-ink/60 font-mono">Empty file. For now.</p>
          )}
          {data.history.map((h) => (
            <Link
              key={h.sessionId}
              to={`/debrief/${h.sessionId}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-paper"
            >
              <span className="text-2xl" aria-hidden>
                {h.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{h.scenario}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                  {h.score}/{h.possible} caught
                </p>
              </div>
              <span
                className={`tabular font-display text-sm ${
                  h.damageDollars <= 0 ? "text-verified" : "text-redink"
                }`}
              >
                {h.damageDollars <= 0 ? usd(h.damageDollars) : `-${usd(h.damageDollars)}`}
              </span>
              <Stamp verdict={h.verdict} size="sm" />
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link to="/codex" className="btn text-xs">
            Open the Tactic Codex →
          </Link>
        </div>
      </section>
    </div>
  );
}

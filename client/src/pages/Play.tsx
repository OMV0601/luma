import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

/**
 * Judge Mode: /play?scenario=<slug> (default payday)
 * Instant guest session -> straight into a round. Built to be handed to a
 * judge during Q&A with zero setup. The slug passes through untouched so
 * Scam Factory-generated scenarios deep-link too; the server rejects
 * unknown slugs.
 */
export default function Play() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const scenario = params.get("scenario") || "payday";
    (async () => {
      await api.guest();
      await qc.invalidateQueries({ queryKey: ["me"] });
      nav(`/round/${scenario}`, { replace: true });
    })();
  }, [nav, params, qc]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="font-mono text-sm uppercase tracking-widest animate-pulse">
        Opening a case file…
      </p>
    </div>
  );
}

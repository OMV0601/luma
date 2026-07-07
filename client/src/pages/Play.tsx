import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

const VALID = ["payday", "fraudcall", "lease"];

/**
 * Judge Mode: /play?scenario=payday|fraudcall|lease
 * Instant guest session -> straight into a round. Built to be handed to a
 * judge during Q&A with zero setup.
 */
export default function Play() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const scenario = VALID.includes(params.get("scenario") ?? "")
      ? params.get("scenario")!
      : "payday";
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

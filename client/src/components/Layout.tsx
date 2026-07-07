import { Link, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderSearch } from "lucide-react";
import { api } from "../api";
import type { Me } from "../types";

/** Minimal top bar: logo, Gauntlet, Profile. No hub chrome. */
export default function Layout() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api.me<Me>() });
  const loc = useLocation();
  const inRound = loc.pathname.startsWith("/round");

  return (
    <div className="min-h-dvh flex flex-col">
      {!inRound && (
        <header className="border-b-2 border-ink bg-paper-bright">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-display text-lg tracking-tight">
              <FolderSearch className="h-5 w-5" aria-hidden />
              FOOLPROOF
            </Link>
            <nav className="flex items-center gap-4 font-mono text-xs uppercase tracking-wider">
              <Link to="/gauntlet" className="hover:underline underline-offset-4">
                The Gauntlet
              </Link>
              <Link to="/profile" className="hover:underline underline-offset-4">
                Street Smarts
              </Link>
              <Link to="/codex" className="hover:underline underline-offset-4">
                Codex
              </Link>
            </nav>
            {me?.user && (
              <span className="ml-auto font-mono text-xs text-ink/60 hidden sm:block">
                AGENT: {me.user.username.toUpperCase()}
              </span>
            )}
          </div>
        </header>
      )}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

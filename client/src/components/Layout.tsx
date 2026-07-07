import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderSearch, Type } from "lucide-react";
import { api } from "../api";
import type { Me } from "../types";

const READABLE_KEY = "fp-readable";

/** Minimal top bar: logo, Gauntlet, Profile. No hub chrome. */
export default function Layout() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api.me<Me>() });
  const loc = useLocation();
  const inRound = loc.pathname.startsWith("/round");

  // Readable mode: Atkinson Hyperlegible for running text, persisted.
  const [readable, setReadable] = useState(() => localStorage.getItem(READABLE_KEY) === "1");
  useEffect(() => {
    document.documentElement.classList.toggle("readable", readable);
    localStorage.setItem(READABLE_KEY, readable ? "1" : "0");
  }, [readable]);

  return (
    <div className="min-h-dvh flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 btn-ink px-3 py-1 text-xs"
      >
        Skip to content
      </a>
      {!inRound && (
        <header className="border-b-2 border-ink bg-paper-bright">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-2 font-display text-lg tracking-tight">
              <FolderSearch className="h-5 w-5" aria-hidden />
              FOOLPROOF
            </Link>
            <nav className="flex items-center gap-3 sm:gap-4 font-mono text-xs uppercase tracking-wider">
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
            <div className="ml-auto flex items-center gap-3">
              {me?.user && (
                <span className="font-mono text-xs text-ink/60 hidden sm:block">
                  AGENT: {me.user.username.toUpperCase()}
                </span>
              )}
              <button
                onClick={() => setReadable(!readable)}
                aria-pressed={readable}
                aria-label="Toggle readable font (Atkinson Hyperlegible)"
                title="Readable font"
                className={`border-2 rounded-md p-1.5 transition-colors ${
                  readable
                    ? "border-verified text-verified bg-verified/10"
                    : "border-ink/40 text-ink/60 hover:border-ink hover:text-ink"
                }`}
              >
                <Type className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>
        </header>
      )}
      <main id="main" className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

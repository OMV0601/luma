import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderSearch, Type, LogOut } from "lucide-react";
import { api } from "../api";
import type { Me } from "../types";
import DemoTour from "../tour/DemoTour";

const READABLE_KEY = "fp-readable";

/** Minimal top bar: logo, Gauntlet, Profile. No hub chrome. */
export default function Layout() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api.me<Me>() });
  const qc = useQueryClient();
  const nav = useNavigate();
  const loc = useLocation();
  const inRound = loc.pathname.startsWith("/round");

  async function logout() {
    await api.logout();
    await qc.invalidateQueries({ queryKey: ["me"] });
    nav("/");
  }

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
        <header className="border-b-2 border-ink bg-paper-bright safe-t">
          {/* Top row: logo + font toggle. Nav drops to its own row on phones. */}
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4 sm:gap-6 flex-wrap">
            <Link
              to="/"
              className="flex items-center gap-2 font-display text-lg tracking-tight"
              data-tour="nav-home"
            >
              <FolderSearch className="h-5 w-5" aria-hidden />
              FOOLPROOF
            </Link>
            <nav className="order-3 w-full sm:order-none sm:w-auto flex items-center gap-4 sm:gap-4 font-mono text-[11px] sm:text-xs uppercase tracking-wider">
              <Link to="/gauntlet" className="hover:underline underline-offset-4" data-tour="nav-gauntlet">
                Gauntlet
              </Link>
              <Link to="/profile" className="hover:underline underline-offset-4" data-tour="nav-profile">
                Street Smarts
              </Link>
              <Link to="/codex" className="hover:underline underline-offset-4" data-tour="nav-codex">
                Codex
              </Link>
            </nav>
            <div className="ml-auto flex items-center gap-3">
              {me?.user && (
                <span className="font-mono text-xs text-ink/60 hidden sm:block">
                  AGENT: {me.user.username.toUpperCase()}
                </span>
              )}
              {me?.user && (
                <button
                  onClick={logout}
                  aria-label="Log out"
                  title="Log out"
                  className="border-2 border-ink/40 text-ink/60 hover:border-ink hover:text-ink rounded-md p-2 transition-colors"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                </button>
              )}
              <button
                onClick={() => setReadable(!readable)}
                aria-pressed={readable}
                aria-label="Toggle readable font (Atkinson Hyperlegible)"
                title="Readable font"
                data-tour="readable"
                className={`border-2 rounded-md p-2 transition-colors ${
                  readable
                    ? "border-verified text-verified bg-verified/10"
                    : "border-ink/40 text-ink/60 hover:border-ink hover:text-ink"
                }`}
              >
                <Type className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </header>
      )}
      <main id="main" className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <DemoTour />
    </div>
  );
}

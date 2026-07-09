import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ShieldCheck } from "lucide-react";
import { api } from "../api";
import { useFocusTrap } from "../useFocusTrap";

type Mode = "signup" | "login";

/**
 * Sign up / log in, case-file styled. Guests stay one tap away so the demo
 * path never needs an account. On a fresh signup we surface `isNew` so the
 * caller can launch the first-time walkthrough.
 */
export default function AuthModal({
  initialMode = "signup",
  onSuccess,
  onGuest,
  onClose,
}: {
  initialMode?: Mode;
  onSuccess: (isNew: boolean) => void;
  onGuest: () => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<null | "auth" | "guest">(null);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef);

  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy("auth");
    setError(null);
    try {
      const res = isSignup
        ? await api.signup(username.trim(), password)
        : await api.login(username.trim(), password);
      onSuccess(res.isNew);
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  }

  async function guest() {
    if (busy) return;
    setBusy("guest");
    setError(null);
    try {
      await api.guest();
      onGuest();
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center sm:justify-center p-0 sm:p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={isSignup ? "Create your account" : "Log in"}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="paper-card w-full sm:max-w-sm rounded-b-none sm:rounded-md p-6 outline-none safe-b"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="stamp-text text-[10px] font-bold text-redink">
              {isSignup ? "OPEN A CASE FILE" : "RE-OPEN YOUR FILE"}
            </p>
            <h2 className="font-display text-2xl mt-1">
              {isSignup ? "Create your account" : "Welcome back, agent"}
            </h2>
          </div>
          <button className="btn px-2 py-1 text-xs" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">Codename</span>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. nighthawk"
              autoComplete="username"
              className="mt-1 w-full border-2 border-ink rounded-md bg-paper-bright px-3 py-2.5"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "6+ characters" : "your password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="mt-1 w-full border-2 border-ink rounded-md bg-paper-bright px-3 py-2.5"
            />
          </label>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-redink font-mono text-xs"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button type="submit" className="btn-ink w-full py-2.5" disabled={busy !== null}>
            {busy === "auth" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSignup ? (
              "Create account & start"
            ) : (
              "Log in"
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs">
          <button
            className="font-mono text-ink/60 hover:text-ink underline underline-offset-4"
            onClick={() => {
              setMode(isSignup ? "login" : "signup");
              setError(null);
            }}
          >
            {isSignup ? "Already have an account? Log in" : "New here? Create an account"}
          </button>
        </div>

        <div className="mt-5 pt-4 border-t-2 border-dashed border-ink/20">
          <button
            className="btn w-full py-2 text-xs"
            onClick={guest}
            disabled={busy !== null}
          >
            {busy === "guest" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Skip — try one round as a guest"}
          </button>
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-ink/40">
            <ShieldCheck className="h-3 w-3" aria-hidden /> Passwords are hashed. No email, no real money, ever.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

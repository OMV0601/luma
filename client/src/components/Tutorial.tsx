import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { useFocusTrap } from "../useFocusTrap";

/**
 * First-time walkthrough. Five steps, one of them genuinely interactive —
 * the player flags a live tactic and gets it right before moving on, so they
 * learn the core mechanic by doing it, not by reading about it. Modern,
 * animated, case-file styled. Shown on first signup; replayable anytime.
 */

const TOTAL = 5;

export default function Tutorial({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef);

  // Interactive step state
  const [caught, setCaught] = useState(false);
  const [wrongPick, setWrongPick] = useState<string | null>(null);

  const go = (d: number) => {
    setDir(d);
    setStep((s) => Math.min(Math.max(s + d, 0), TOTAL - 1));
  };

  const canAdvance = step !== 1 || caught; // step 2 (index 1) gates on catching

  const slide = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="How to play FoolProof"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="paper-card w-full sm:max-w-lg rounded-b-none sm:rounded-md p-0 outline-none overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* progress */}
        <div className="flex items-center gap-2 px-6 pt-5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-redink" : "bg-ink/15"
              }`}
            />
          ))}
          <button
            onClick={onDone}
            className="ml-2 font-mono text-[10px] uppercase tracking-wider text-ink/40 hover:text-ink"
          >
            Skip
          </button>
        </div>

        <div className="px-6 py-6 overflow-y-auto">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
            >
              {step === 0 && (
                <Step
                  kicker="THE MISSION"
                  title="Get scammed here, so it never happens out there."
                >
                  <p>
                    Every character in FoolProof is running a <b>real, documented scam</b> — a payday
                    lender, a fake bank caller, a predatory landlord.
                  </p>
                  <p>
                    Other apps teach you to <i>read</i> about scams. Here, you get scammed — safely —
                    so you build the reflex to catch the real one when it comes.
                  </p>
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    {["🤝", "💼", "📞", "🏠"].map((e) => (
                      <div key={e} className="paper-card shadow-none py-3 text-2xl" aria-hidden>
                        {e}
                      </div>
                    ))}
                  </div>
                </Step>
              )}

              {step === 1 && (
                <Step kicker="SKILL 1 — CALL IT OUT" title="Catch the manipulation live.">
                  <p>
                    During a conversation you can <b>flag any message</b> and name the tactic. Try it
                    now — this lender just said:
                  </p>
                  <div className="paper-card shadow-none border-l-4 border-l-redink p-3 mt-3 relative">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-redink/80">
                      Quick Cash Danny
                    </p>
                    <p className="text-sm mt-1">
                      “I can lock this rate <b>if we sign today</b> — your mechanic isn't getting
                      cheaper while the car sits. Clock's ticking, friend.”
                    </p>
                    {!caught && (
                      <span className="absolute -right-2 -top-2 h-8 w-8 rounded-full border-2 border-ink bg-paper-bright flex items-center justify-center animate-pulse">
                        <Flag className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  {!caught ? (
                    <>
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ink/50">
                        Which tactic is this?
                      </p>
                      <div className="mt-2 grid gap-2">
                        {[
                          { id: "authority", label: "Authority Impersonation" },
                          { id: "urgency", label: "Urgency Pressure", correct: true },
                          { id: "reciprocity", label: "Reciprocity Bait" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() =>
                              opt.correct ? setCaught(true) : setWrongPick(opt.id)
                            }
                            className={`text-left border-2 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                              wrongPick === opt.id
                                ? "border-amber text-amber bg-amber/10 shake"
                                : "border-ink hover:bg-paper"
                            }`}
                          >
                            {opt.label}
                            {wrongPick === opt.id && " — not quite"}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-3 flex items-center gap-2 border-2 border-verified bg-verified/10 rounded-md px-3 py-2.5"
                    >
                      <Check className="h-5 w-5 text-verified shrink-0" />
                      <p className="text-sm">
                        <b className="text-verified">CAUGHT IN THE ACT.</b> That's{" "}
                        <b>Urgency Pressure</b> — a fake deadline to stop you thinking. Catching it
                        live is the highest-value move in the game.
                      </p>
                    </motion.div>
                  )}
                </Step>
              )}

              {step === 2 && (
                <Step kicker="SKILL 2 — YOUR MOVE" title="Take it, negotiate it, or walk.">
                  <p>Every round ends with a decision:</p>
                  <div className="mt-3 space-y-2">
                    <div className="btn-red w-full justify-start px-3 py-2 text-[11px]">SIGN AS-IS</div>
                    <div className="btn w-full justify-start px-3 py-2 text-[11px]">
                      SIGN — WITH MY CHANGES
                    </div>
                    <div className="btn-green w-full justify-start px-3 py-2 text-[11px]">WALK AWAY</div>
                  </div>
                  <div className="mt-4 border-2 border-dashed border-ink/25 rounded-md p-3">
                    <p className="stamp-text text-[10px] font-bold text-redink">THE SECRET</p>
                    <p className="text-sm mt-1">
                      Walking away <i>blind</i> scores low. The points are in the tactics you{" "}
                      <b>caught</b> — a pro doesn't flee, they see the con coming and negotiate from
                      strength.
                    </p>
                  </div>
                </Step>
              )}

              {step === 3 && (
                <Step kicker="THE PAYOFF" title="Read the evidence file.">
                  <p>
                    After each round you get an annotated replay — every tactic stamped, and one
                    number in red: what the mistake would've cost you, computed with real financial
                    math.
                  </p>
                  <div className="mt-3 paper-card shadow-none p-4">
                    <p className="stamp-text text-[9px] font-semibold text-ink/50">
                      WHAT IT WOULD HAVE COST YOU
                    </p>
                    <p className="font-display text-4xl text-redink tabular mt-1">-$1,240</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="stamp-text text-[9px] font-bold text-verified border-2 border-verified rounded-sm px-1.5 py-0.5">
                        ✓ URGENCY — CAUGHT
                      </span>
                      <span className="stamp-text text-[9px] font-bold text-redink border-2 border-redink rounded-sm px-1.5 py-0.5">
                        ✗ FEE BURIAL — FELL FOR IT
                      </span>
                    </div>
                  </div>
                </Step>
              )}

              {step === 4 && (
                <Step kicker="YOU'RE READY" title="Five scammers are waiting.">
                  <p>
                    Flag their tactics, ask the questions that corner them, and decide with your eyes
                    open. The sharper you get here, the safer you are out there.
                  </p>
                  <p className="font-mono text-sm text-ink/60 mt-2">
                    Tip: you can reopen this walkthrough anytime from the “How to play” button.
                  </p>
                </Step>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* controls */}
        <div className="border-t-2 border-ink px-6 py-4 flex items-center justify-between safe-b">
          <button
            onClick={() => go(-1)}
            disabled={step === 0}
            className="btn px-3 py-2 text-xs disabled:opacity-30"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          {step < TOTAL - 1 ? (
            <button
              onClick={() => go(1)}
              disabled={!canAdvance}
              className="btn-ink px-4 py-2 text-xs disabled:opacity-40"
              title={!canAdvance ? "Catch the tactic first" : undefined}
            >
              {step === 1 && !caught ? "Catch it to continue" : "Next"}{" "}
              {canAdvance && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <button onClick={onDone} className="btn-ink px-5 py-2 text-xs">
              Enter the Gauntlet <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Step({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="stamp-text text-[10px] font-bold text-redink">{kicker}</p>
      <h2 className="font-display text-2xl mt-1 leading-tight">{title}</h2>
      <div className="mt-3 space-y-2 text-sm text-ink/80 leading-snug [&_b]:text-ink">{children}</div>
    </div>
  );
}

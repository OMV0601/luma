import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "../api";
import { TOUR_STEPS, type TourStep, type TourAction } from "./steps";

/**
 * The self-driving demo. Mounted once in Layout; started via startAutoDemo()
 * (hands-free video demo for judges) or startGuidedTour() (self-paced, with
 * buttons). Both drive a REAL round through the actual DOM (native-setter
 * typing so React controlled inputs update) and dim the screen to a single
 * spotlit region with a case-file popup.
 *
 * AUTO   — plays every step, advances on a timer, no Next button. Pause/Exit.
 * GUIDED — skips autoOnly showcase steps, waits for Next.
 *
 * Layering: blocker+dim z-60 · popup/controls z-[65] · cursor z-[80]. App
 * dialogs sit at z-50, so the spotlight hole reveals them through the dim.
 */

export type TourMode = "auto" | "guided";

export const TOUR_EVENT = "fp:start-tour";
export const startAutoDemo = () =>
  window.dispatchEvent(new CustomEvent(TOUR_EVENT, { detail: { mode: "auto" } }));
export const startGuidedTour = () =>
  window.dispatchEvent(new CustomEvent(TOUR_EVENT, { detail: { mode: "guided" } }));
/** @deprecated use startAutoDemo / startGuidedTour */
export const startDemoTour = startAutoDemo;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const DWELL_MIN = 2600;
const DWELL_MAX = 5400;

/** querySelector with a "::last" suffix (last match wins). */
function resolveEl(selector: string): HTMLElement | null {
  if (selector.endsWith("::last")) {
    const all = document.querySelectorAll<HTMLElement>(selector.slice(0, -6));
    return all.length ? all[all.length - 1] : null;
  }
  return document.querySelector<HTMLElement>(selector);
}

async function waitUntil(fn: () => boolean, timeout = 12000, interval = 150): Promise<boolean> {
  const t0 = Date.now();
  while (!fn()) {
    if (Date.now() - t0 > timeout) return false;
    await sleep(interval);
  }
  return true;
}

/** Set a React controlled <input> through the native setter so onChange fires. */
function setReactInput(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Types the popup body out in real time (case-file teletype). Clicking the
 * text completes it instantly; reduced motion renders it whole. Calls onDone
 * exactly once when the text is fully shown (the auto-advance waits on it).
 */
function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? text.length : 0);
  const firedRef = useRef(false);

  const finish = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    onDone?.();
  }, [onDone]);

  useEffect(() => {
    firedRef.current = false;
    if (reduce) {
      setShown(text.length);
      finish();
      return;
    }
    setShown(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 2; // ~100 chars/sec — brisk, still visibly typed
      setShown(i);
      if (i >= text.length) {
        clearInterval(timer);
        finish();
      }
    }, 20);
    return () => clearInterval(timer);
  }, [text, reduce, finish]);

  const done = shown >= text.length;
  return (
    <span
      onClick={() => {
        setShown(text.length);
        finish();
      }}
      className={done ? "" : "cursor-pointer"}
    >
      {text.slice(0, shown)}
      {!done && (
        <span className="animate-pulse" aria-hidden>
          ▌
        </span>
      )}
    </span>
  );
}

const PAD = 8;
const POPUP_W = 352;

function measureBox(el: Element): Box {
  const r = el.getBoundingClientRect();
  return { left: r.left - PAD, top: r.top - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
}

/** Place the popup below the box if it fits, else above; clamp to viewport. */
function popupPosition(box: Box): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = Math.min(Math.max(12, box.left + box.width / 2 - POPUP_W / 2), vw - POPUP_W - 12);
  const below = box.top + box.height + 14;
  if (below + 240 < vh) return { left, top: below };
  if (box.top > 240) return { left, bottom: vh - box.top + 14 };
  return { left, top: Math.max(12, vh - 260) };
}

export default function DemoTour() {
  const nav = useNavigate();
  const reduce = useReducedMotion();

  const [mode, setMode] = useState<TourMode>("guided");
  const [idx, setIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<"acting" | "reading">("acting");
  const [box, setBox] = useState<Box | null>(null);
  const [pulse, setPulse] = useState(0);
  const [cursorOn, setCursorOn] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const [paused, setPausedState] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = useMemo(
    () => (mode === "auto" ? TOUR_STEPS : TOUR_STEPS.filter((s) => !s.autoOnly)),
    [mode]
  );
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const runRef = useRef(0);
  const targetElRef = useRef<Element | null>(null);
  const pausedRef = useRef(false);
  const setPaused = (v: boolean) => {
    pausedRef.current = v;
    setPausedState(v);
  };

  const bodyFor = useCallback(
    (s: TourStep) => (mode === "auto" && s.bodyAuto ? s.bodyAuto : s.body),
    [mode]
  );

  const applyCursor = useCallback(() => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
    }
  }, []);

  /** Ease the fake cursor to an element (distance-scaled duration). */
  const moveCursorTo = useCallback(
    (el: Element) =>
      new Promise<void>((resolve) => {
        const r = el.getBoundingClientRect();
        const toX = r.left + Math.min(r.width * 0.5, 180);
        const toY = r.top + r.height * 0.5;
        const { x: fromX, y: fromY } = posRef.current;
        const dist = Math.hypot(toX - fromX, toY - fromY);
        const ms = reduce ? 0 : Math.min(1100, 280 + dist * 0.7);
        if (ms === 0) {
          posRef.current = { x: toX, y: toY };
          applyCursor();
          return resolve();
        }
        const t0 = performance.now();
        const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const frame = (now: number) => {
          const p = Math.min(1, (now - t0) / ms);
          const e = ease(p);
          posRef.current = { x: fromX + (toX - fromX) * e, y: fromY + (toY - fromY) * e };
          applyCursor();
          if (p < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      }),
    [reduce, applyCursor]
  );

  const end = useCallback(() => {
    runRef.current += 1; // cancel any in-flight step
    setIdx(null);
    setBox(null);
    setCursorOn(false);
    setPaused(false);
    targetElRef.current = null;
  }, []);

  const endToApp = useCallback(() => {
    end();
    nav("/gauntlet");
  }, [end, nav]);

  const advance = useCallback(() => {
    setIdx((i) => (i === null ? null : i + 1 >= stepsRef.current.length ? null : i + 1));
  }, []);

  /* Start on the global event, carrying the mode. */
  useEffect(() => {
    const onStart = (e: Event) => {
      const m = (e as CustomEvent<{ mode?: TourMode }>).detail?.mode ?? "auto";
      posRef.current = { x: window.innerWidth / 2, y: window.innerHeight * 0.7 };
      applyCursor();
      setMode(m);
      setPaused(false);
      setIdx(0);
    };
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, [applyCursor]);

  /* Escape ends; Space toggles pause in auto mode. */
  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") end();
      else if (e.key === " " && mode === "auto" && phase === "reading") {
        e.preventDefault();
        setPaused(!pausedRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, mode, phase, end]);

  /* Keep the spotlight glued to its element through scroll/resize. */
  useEffect(() => {
    if (idx === null || phase !== "reading") return;
    const remeasure = () => {
      if (targetElRef.current?.isConnected) setBox(measureBox(targetElRef.current));
    };
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", remeasure, true);
    return () => {
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure, true);
    };
  }, [idx, phase]);

  /* Auto-advance: once the text finishes typing, run a dwell timer (pausable)
   * and move on. requestAnimationFrame keeps the progress bar and the advance
   * perfectly in sync, and honors pause without resetting. */
  useEffect(() => {
    if (mode !== "auto" || phase !== "reading" || !typingDone || idx === null) return;
    const step = steps[idx];
    const body = bodyFor(step);
    const dwell = step.dwellMs ?? Math.min(DWELL_MAX, Math.max(DWELL_MIN, body.length * 22));
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let fired = false;
    setProgress(0);
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!pausedRef.current) acc += dt;
      const p = Math.min(1, acc / dwell);
      setProgress(p);
      if (p >= 1 && !fired) {
        fired = true;
        if (idx + 1 >= steps.length) endToApp();
        else setIdx(idx + 1);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, phase, typingDone, idx, steps, bodyFor, endToApp]);

  /* The step runner. */
  useEffect(() => {
    if (idx === null) return;
    const token = ++runRef.current;
    const alive = () => runRef.current === token;
    const step = stepsRef.current[idx];

    const skipOrEnd = () => {
      if (!alive()) return;
      if (step.optional) advance();
      else end();
    };

    const runActions = async (actions: TourAction[]): Promise<boolean> => {
      for (const a of actions) {
        if (!alive()) return false;
        switch (a.type) {
          case "ensure-guest": {
            const me = await api.me<{ user: unknown }>();
            if (!me.user) await api.guest();
            break;
          }
          case "sleep":
            await sleep(a.ms ?? 400);
            break;
          case "click": {
            if (!(await waitUntil(() => Boolean(resolveEl(a.selector!)), 9000))) return false;
            const el = resolveEl(a.selector!)!;
            el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
            await sleep(reduce ? 40 : 380);
            if (!alive()) return false;
            setCursorOn(true);
            await moveCursorTo(el);
            setPulse((p) => p + 1);
            await sleep(reduce ? 40 : 180);
            el.click();
            await sleep(reduce ? 80 : 320);
            break;
          }
          case "type": {
            const el = resolveEl(a.selector!) as HTMLInputElement | null;
            if (!el) return false;
            el.focus();
            for (const ch of a.text ?? "") {
              if (!alive()) return false;
              setReactInput(el, el.value + ch);
              await sleep(reduce ? 0 : 26);
            }
            await sleep(150);
            break;
          }
          case "wait-reply": {
            await sleep(600);
            await waitUntil(() => !document.querySelector('[data-tour="draft"]'), 30000, 250);
            await sleep(reduce ? 80 : 450);
            break;
          }
        }
      }
      return true;
    };

    (async () => {
      setPhase("acting");
      setTypingDone(false);
      setBox(null);
      targetElRef.current = null;

      if (step.route && window.location.pathname !== step.route) {
        nav(step.route);
        await sleep(120);
      }
      if (step.waitFor) {
        const ok = await waitUntil(() => Boolean(resolveEl(step.waitFor!)), step.timeoutMs ?? 12000);
        if (!alive()) return;
        if (!ok) return skipOrEnd();
      }
      if (step.actions && !(await runActions(step.actions))) {
        return skipOrEnd();
      }
      if (!alive()) return;

      if (step.target) {
        const ok = await waitUntil(() => Boolean(resolveEl(step.target!)), step.timeoutMs ?? 9000);
        if (!alive()) return;
        if (!ok) return skipOrEnd();
        const el = resolveEl(step.target!)!;
        targetElRef.current = el;
        el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
        await sleep(reduce ? 60 : 480);
        if (!alive()) return;
        setBox(measureBox(el));
      }
      setCursorOn(false);
      setPhase("reading");
    })();
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (idx === null) return null;

  const step = steps[idx];
  const last = idx === steps.length - 1;
  const reading = phase === "reading";
  const isAuto = mode === "auto";

  return (
    <>
      {/* Input blocker — stray user clicks must not derail the scripted round. */}
      <div className="fixed inset-0 z-[60]" aria-hidden />

      {/* Dim + spotlight. The hole is the absence of the giant box-shadow. */}
      {reading &&
        (box ? (
          <motion.div
            aria-hidden
            className="fixed z-[60] rounded-md border-2 border-redink pointer-events-none"
            initial={false}
            animate={{ left: box.left, top: box.top, width: box.width, height: box.height }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 }}
            style={{ boxShadow: "0 0 0 200vmax rgba(28, 25, 23, 0.66)" }}
          />
        ) : (
          <div aria-hidden className="fixed inset-0 z-[60] bg-ink/70" />
        ))}

      {/* "Driving" pill while the bot acts. */}
      {!reading && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[65] pointer-events-none">
          <span className="stamp-text text-[10px] font-bold bg-ink text-paper-bright border-2 border-ink rounded-md px-3 py-1.5 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-redink animate-pulse" />
            {isAuto ? "AUTO-DEMO — FOOLPROOF IS DRIVING" : "PLAYING…"}
          </span>
        </div>
      )}

      {/* Auto mode: a persistent Exit reachable even mid-drive. */}
      {isAuto && (
        <button
          onClick={end}
          className="fixed top-4 right-4 z-[66] btn px-3 py-1.5 text-[11px]"
        >
          ✕ Exit demo
        </button>
      )}

      {/* The popup card. */}
      {reading && (
        <div
          className={box ? "fixed z-[65]" : "fixed inset-0 z-[65] flex items-center justify-center p-4"}
          style={box ? popupPosition(box) : undefined}
          role="dialog"
          aria-label={step.title}
        >
          <motion.div
            key={step.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="paper-card p-4"
            style={{ width: POPUP_W, maxWidth: "calc(100vw - 24px)" }}
          >
            <p className="stamp-text text-[10px] font-bold text-redink">{step.title}</p>
            <p className="text-sm mt-2 leading-snug text-ink/90">
              <Typewriter key={step.id} text={bodyFor(step)} onDone={() => setTypingDone(true)} />
            </p>

            {isAuto ? (
              <div className="mt-4">
                {/* dwell progress */}
                <div className="h-1 rounded-full bg-ink/15 overflow-hidden">
                  <div
                    className="h-full bg-redink"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-ink/50">
                    {idx + 1} / {steps.length}
                    {paused && <span className="text-redink font-bold"> · PAUSED</span>}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="btn px-3 py-1.5 text-[11px]"
                      onClick={() => setPaused(!pausedRef.current)}
                    >
                      {paused ? "▶ Resume" : "❚❚ Pause"}
                    </button>
                    <button className="btn-ink px-3 py-1.5 text-[11px]" onClick={advance}>
                      Skip →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-ink/50">
                  {idx + 1} / {steps.length}
                </span>
                <div className="flex gap-2">
                  <button className="btn px-3 py-1.5 text-[11px]" onClick={end}>
                    {last ? "Close" : "Skip tour"}
                  </button>
                  {last ? (
                    <button className="btn-ink px-3 py-1.5 text-[11px]" onClick={endToApp}>
                      Try it yourself →
                    </button>
                  ) : (
                    <button className="btn-ink px-3 py-1.5 text-[11px]" onClick={advance} autoFocus>
                      Next →
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* The fake cursor — only on screen while it's actually working. */}
      <div
        ref={cursorRef}
        aria-hidden
        className="fixed left-0 top-0 z-[80] pointer-events-none transition-opacity duration-300"
        style={{
          transform: `translate(${posRef.current.x}px, ${posRef.current.y}px)`,
          opacity: cursorOn ? 1 : 0,
        }}
      >
        <svg width="26" height="30" viewBox="0 0 26 30" className="drop-shadow-md">
          <path
            d="M2 1 L2 23 L8 18 L12 28 L16.5 26 L12.5 16.5 L20 16 Z"
            fill="#1C1917"
            stroke="#FAF6EA"
            strokeWidth="1.6"
          />
        </svg>
        <span
          key={pulse}
          className={pulse > 0 ? "tour-pulse" : "hidden"}
          style={{ position: "absolute", left: -12, top: -10 }}
        />
      </div>
    </>
  );
}

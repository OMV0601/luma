import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "../api";
import { TOUR_STEPS, type TourAction } from "./steps";

/**
 * The self-driving demo. Mounted once in Layout; started from anywhere via
 * startDemoTour(). Takes the cursor (a fake one — animated, with click
 * pulses), drives a real round through the actual DOM (native-setter typing
 * so React controlled inputs update), and between automated bursts dims the
 * screen to a single spotlit region with a case-file popup that waits for
 * the viewer to read.
 *
 * Layering: blocker+dim z-60 · popup/pill z-[65] · cursor z-[80]. App
 * dialogs sit at z-50, so the spotlight hole reveals them through the dim.
 */

export const TOUR_EVENT = "fp:start-tour";
export const startDemoTour = () => window.dispatchEvent(new Event(TOUR_EVENT));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

const PAD = 8;
const POPUP_W = 352;

function measureBox(el: Element): Box {
  const r = el.getBoundingClientRect();
  return {
    left: r.left - PAD,
    top: r.top - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

/** Place the popup below the box if it fits, else above; clamp to viewport. */
function popupPosition(box: Box): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = Math.min(Math.max(12, box.left + box.width / 2 - POPUP_W / 2), vw - POPUP_W - 12);
  const below = box.top + box.height + 14;
  if (below + 240 < vh) return { left, top: below };
  const above = vh - box.top + 14;
  if (box.top > 240) return { left, bottom: above };
  return { left, top: Math.max(12, vh - 260) }; // huge target: pin near bottom
}

export default function DemoTour() {
  const nav = useNavigate();
  const reduce = useReducedMotion();

  const [idx, setIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<"acting" | "reading">("acting");
  const [box, setBox] = useState<Box | null>(null);
  const [pulse, setPulse] = useState(0);

  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const runRef = useRef(0);
  const targetElRef = useRef<Element | null>(null);

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
    targetElRef.current = null;
  }, []);

  const advance = useCallback(() => {
    setIdx((i) => {
      if (i === null) return null;
      if (i + 1 >= TOUR_STEPS.length) return null;
      return i + 1;
    });
  }, []);

  /* Start on the global event. */
  useEffect(() => {
    const onStart = () => {
      posRef.current = { x: window.innerWidth / 2, y: window.innerHeight * 0.7 };
      applyCursor();
      setIdx(0);
    };
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, [applyCursor]);

  /* Escape ends the tour. */
  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && end();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, end]);

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

  /* The step runner. */
  useEffect(() => {
    if (idx === null) return;
    const token = ++runRef.current;
    const alive = () => runRef.current === token;
    const step = TOUR_STEPS[idx];

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
            // Streaming draft bubble carries data-tour="draft"; gone = done.
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
      setBox(null);
      targetElRef.current = null;

      if (step.route && window.location.pathname !== step.route) {
        nav(step.route);
        await sleep(120);
      }
      if (step.waitFor) {
        const ok = await waitUntil(() => Boolean(resolveEl(step.waitFor!)), step.timeoutMs ?? 12000);
        if (!alive()) return;
        if (!ok) {
          if (step.optional) advance();
          else end();
          return;
        }
      }
      if (step.actions && !(await runActions(step.actions))) {
        if (alive()) end();
        return;
      }
      if (!alive()) return;

      if (step.target) {
        const ok = await waitUntil(() => Boolean(resolveEl(step.target!)), step.timeoutMs ?? 9000);
        if (!alive()) return;
        if (!ok) {
          if (step.optional) advance();
          else end();
          return;
        }
        const el = resolveEl(step.target!)!;
        targetElRef.current = el;
        el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
        await sleep(reduce ? 60 : 480);
        if (!alive()) return;
        setBox(measureBox(el));
      }
      setPhase("reading");
    })();
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (idx === null) return null;

  const step = TOUR_STEPS[idx];
  const last = idx === TOUR_STEPS.length - 1;
  const reading = phase === "reading";

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

      {/* AUTO pill while the tour is driving. */}
      {!reading && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[65] pointer-events-none">
          <span className="stamp-text text-[10px] font-bold bg-ink text-paper-bright border-2 border-ink rounded-md px-3 py-1.5 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-redink animate-pulse" />
            AUTO-DEMO — FOOLPROOF IS DRIVING
          </span>
        </div>
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
            <p className="stamp-text text-[10px] font-bold text-redink">
              {step.title}
            </p>
            <p className="text-sm mt-2 leading-snug text-ink/90">{step.body}</p>
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-ink/50">
                {idx + 1} / {TOUR_STEPS.length}
              </span>
              <div className="flex gap-2">
                <button className="btn px-3 py-1.5 text-[11px]" onClick={end}>
                  {last ? "Close" : "Skip tour"}
                </button>
                {last ? (
                  <button
                    className="btn-ink px-3 py-1.5 text-[11px]"
                    onClick={() => {
                      end();
                      nav("/gauntlet");
                    }}
                  >
                    Try it yourself →
                  </button>
                ) : (
                  <button className="btn-ink px-3 py-1.5 text-[11px]" onClick={advance} autoFocus>
                    Next →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* The fake cursor. */}
      <div
        ref={cursorRef}
        aria-hidden
        className="fixed left-0 top-0 z-[80] pointer-events-none"
        style={{ transform: `translate(${posRef.current.x}px, ${posRef.current.y}px)` }}
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

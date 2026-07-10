import { useEffect, useRef } from "react";
import { TACTICS } from "../../../shared/tactics";
import { useFocusTrap } from "../useFocusTrap";

/**
 * The "Call It Out" tactic picker — a bottom sheet listing the taxonomy.
 * Correct flags = caught in the act; wrong flags stamp UNFOUNDED later.
 */
export default function FlagPicker({
  onPick,
  onClose,
  already,
}: {
  onPick: (tacticId: string) => void;
  onClose: () => void;
  already: string[];
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Dialog a11y: focus trapped in the sheet (restored on close), Escape closes.
  useFocusTrap(panelRef);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 flex items-end sm:items-center sm:justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Flag this message with a tactic"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        data-tour="flagpicker"
        className="paper-card w-full sm:max-w-md max-h-[75dvh] overflow-y-auto rounded-b-none sm:rounded-md p-4 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="stamp-text text-sm font-bold text-redink">⚑ CALL IT OUT</h3>
          <button className="btn px-2 py-1 text-xs" onClick={onClose}>
            Cancel
          </button>
        </div>
        <p className="text-xs text-ink/60 mt-1 mb-3">
          Name the tactic in this message. Right call = caught in the act. Wrong call = UNFOUNDED.
        </p>
        <ul className="space-y-2">
          {TACTICS.map((t) => {
            const used = already.includes(t.id);
            return (
              <li key={t.id}>
                <button
                  disabled={used}
                  onClick={() => onPick(t.id)}
                  data-tour={`tactic-${t.id}`}
                  className="w-full text-left border-2 border-ink rounded-md px-3 py-2 bg-paper-bright
                    hover:bg-paper disabled:opacity-40 focus-visible:outline focus-visible:outline-2"
                >
                  <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                    {t.name} {used && "✓"}
                  </span>
                  <span className="block text-xs text-ink/60 mt-0.5">{t.definition}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

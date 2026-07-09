import { useEffect, useMemo, useRef, useState } from "react";
import type { ScenarioDocument } from "../types";
import { useFocusTrap } from "../useFocusTrap";

/**
 * The embedded lease document. Planted clauses are tappable: tapping one
 * flags its tactic (a document catch). Flagged clauses render struck-through.
 *
 * PLAIN ENGLISH mode is the jargon translator: every numbered clause gets a
 * one-line translation underneath. The traps aren't labeled — translated
 * honestly, they expose themselves. That's the thesis of the product.
 */
export default function LeaseDoc({
  doc,
  flaggedClauses,
  onFlagClause,
  onClose,
}: {
  doc: ScenarioDocument;
  flaggedClauses: string[];
  onFlagClause: (clauseId: string, tacticId: string) => void;
  onClose: () => void;
}) {
  const [hint, setHint] = useState(false);
  const [plain, setPlain] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Dialog a11y: focus trapped in the panel (restored on close), Escape closes.
  useFocusTrap(panelRef);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Split the document text into plain segments and clause segments.
  const segments = useMemo(() => {
    const sorted = [...doc.clauses].sort((a, b) => a.start - b.start);
    const out: { text: string; clause?: (typeof sorted)[number] }[] = [];
    let cursor = 0;
    for (const c of sorted) {
      if (c.start > cursor) out.push({ text: doc.text.slice(cursor, c.start) });
      out.push({ text: doc.text.slice(c.start, c.end), clause: c });
      cursor = c.end;
    }
    if (cursor < doc.text.length) out.push({ text: doc.text.slice(cursor) });
    return out;
  }, [doc]);

  // Plain mode: paragraphs with translations, planted ones still tappable.
  const paragraphs = useMemo(() => {
    if (!plain) return [];
    return doc.text.split(/\n\n+/).map((text) => {
      const num = text.match(/^(\d+)\./)?.[1];
      const clause = doc.clauses.find((c) => doc.text.slice(c.start, c.end) === text);
      return { text, translation: num ? doc.translations?.[num] : undefined, clause };
    });
  }, [plain, doc]);

  const clauseButton = (
    clause: NonNullable<(typeof segments)[number]["clause"]>,
    text: string,
    key: React.Key
  ) => (
    <button
      key={key}
      onClick={() => onFlagClause(clause.id, clause.tacticId)}
      className={`text-left whitespace-pre-wrap rounded-sm px-0.5 transition-colors
        focus-visible:outline focus-visible:outline-2 ${
          flaggedClauses.includes(clause.id)
            ? "line-through decoration-redink decoration-2 bg-verified/10"
            : "hover:bg-amber/15 underline decoration-dotted decoration-ink/30 underline-offset-4"
        }`}
      aria-label={`Challenge ${clause.label}`}
    >
      {text}
      {flaggedClauses.includes(clause.id) && (
        <span className="stamp-text text-[10px] text-verified font-bold"> [CHALLENGED]</span>
      )}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-3"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={doc.title}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="paper-card w-full max-w-2xl max-h-[88dvh] flex flex-col outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink px-4 py-3">
          <h3 className="font-mono text-xs uppercase tracking-wider font-bold">{doc.title}</h3>
          <div className="flex gap-2">
            <button
              className={`btn px-2 py-1 text-xs ${plain ? "bg-verified/15 border-verified text-verified" : ""}`}
              onClick={() => setPlain(!plain)}
              aria-pressed={plain}
            >
              {plain ? "✓ Plain English" : "Plain English"}
            </button>
            <button className="btn px-2 py-1 text-xs" onClick={() => setHint(!hint)}>
              {hint ? "Hide hint" : "Hint"}
            </button>
            <button className="btn px-2 py-1 text-xs" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        {hint && (
          <p className="px-4 py-2 text-xs font-mono bg-amber/10 text-amber border-b-2 border-ink">
            Something in here is going to cost you. Tap a clause to challenge it on the record.
          </p>
        )}
        {plain && (
          <p className="px-4 py-2 text-xs bg-verified/10 text-verified border-b-2 border-ink">
            Every clause, translated. Jargon is where the money hides — read what it actually says.
          </p>
        )}

        {plain ? (
          <div className="overflow-y-auto px-5 py-4 space-y-4">
            {paragraphs.map((p, i) => (
              <div key={i}>
                <p className="font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">
                  {p.clause ? clauseButton(p.clause, p.text, `c${i}`) : p.text}
                </p>
                {p.translation && (
                  <p className="mt-1 pl-3 border-l-4 border-verified text-[13px] leading-snug text-ink/85">
                    {p.translation}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-y-auto px-5 py-4 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">
            {segments.map((seg, i) =>
              seg.clause ? clauseButton(seg.clause, seg.text, i) : <span key={i}>{seg.text}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

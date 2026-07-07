import { useMemo, useState } from "react";
import type { ScenarioDocument } from "../types";

/**
 * The embedded lease document. Planted clauses are tappable: tapping one
 * flags its tactic (a document catch). Flagged clauses render struck-through.
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

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-3"
      onClick={onClose}
      role="dialog"
      aria-label={doc.title}
    >
      <div
        className="paper-card w-full max-w-2xl max-h-[88dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink px-4 py-3">
          <h3 className="font-mono text-xs uppercase tracking-wider font-bold">{doc.title}</h3>
          <div className="flex gap-2">
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
        <div className="overflow-y-auto px-5 py-4 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">
          {segments.map((seg, i) =>
            seg.clause ? (
              <button
                key={i}
                onClick={() => onFlagClause(seg.clause!.id, seg.clause!.tacticId)}
                className={`text-left whitespace-pre-wrap rounded-sm px-0.5 transition-colors
                  focus-visible:outline focus-visible:outline-2 ${
                    flaggedClauses.includes(seg.clause.id)
                      ? "line-through decoration-redink decoration-2 bg-verified/10"
                      : "hover:bg-amber/15 underline decoration-dotted decoration-ink/30 underline-offset-4"
                  }`}
                aria-label={`Challenge ${seg.clause.label}`}
              >
                {seg.text}
                {flaggedClauses.includes(seg.clause.id) && (
                  <span className="stamp-text text-[10px] text-verified font-bold"> [CHALLENGED]</span>
                )}
              </button>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

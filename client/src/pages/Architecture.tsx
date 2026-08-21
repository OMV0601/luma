import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";

/**
 * The build, as a case file. Shown on camera in the demo video instead of a
 * slide — every box is a real module in the repo, labeled with its path.
 */

function Box({
  title,
  path,
  accent,
  children,
}: {
  title: string;
  path?: string;
  accent?: "red" | "green" | "amber";
  children: React.ReactNode;
}) {
  const border =
    accent === "red"
      ? "border-l-redink"
      : accent === "green"
        ? "border-l-verified"
        : accent === "amber"
          ? "border-l-amber"
          : "border-l-ink";
  return (
    <div className={`paper-card p-4 border-l-4 ${border}`}>
      <p className="stamp-text text-[11px] font-bold">{title}</p>
      {path && <p className="font-mono text-[10px] text-ink/40 mt-0.5">{path}</p>}
      <p className="text-sm mt-1.5 leading-snug text-ink/80">{children}</p>
    </div>
  );
}

const Down = () => (
  <div className="flex justify-center py-1" aria-hidden>
    <ArrowDown className="h-5 w-5 text-ink/40" />
  </div>
);

export default function Architecture() {
  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-10">
      <p className="stamp-text text-xs text-redink font-bold">EXHIBIT T — TECHNICAL</p>
      <h1 className="font-display text-3xl mt-1">HOW THE MACHINE WORKS</h1>
      <p className="text-sm text-ink/70 mt-2 max-w-xl">
        Three independent systems. The scammer never grades its own exam, and the money math
        is engineered — never generated.
      </p>

      <div className="mt-8 space-y-1">
        <Box title="① THE ADVERSARY ENGINE" path="server/src/adversary/" accent="red">
          Every scammer = a persona + a JSON <b>playbook</b>: five tactic beats, escalation
          rules, concessions (the accurate numbers the character must admit when cornered),
          and hard guardrails. Live rounds stream from Claude (SSE) with a hidden{" "}
          <code className="font-mono text-xs">[[beat:bN]]</code> marker tracking the con's
          progress. No API key? A scripted state machine walks the same playbook — the whole
          loop works offline, so the demo cannot break.
        </Box>
        <Down />
        <Box title="② THE REFEREE — INDEPENDENT GRADER" path="server/src/referee.ts" accent="amber">
          A <b>second, separate</b> model call receives the transcript, the 10-tactic
          taxonomy, the playbook's ground-truth beats, and your live flags — and returns
          strict JSON: <b>caught / resisted / fell for it</b>, per tactic, with an evidence
          quote. Offline, a deterministic grader does the same job from flag + pattern data.
        </Box>
        <Down />
        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-stretch">
          <Box title="③ THE DAMAGE ENGINE — NO AI" path="server/src/damage/*.ts" accent="green">
            Pure TypeScript functions compute the real cost of your decision: the CFPB payday
            formula (391% APR), the Reg CC fake-check timeline, lease clause totals.{" "}
            <b>34 unit tests</b> lock the math. The AI never invents a number.
          </Box>
          <div className="hidden sm:flex items-center" aria-hidden>
            <ArrowRight className="h-5 w-5 text-ink/40" />
          </div>
          <Box title="CROSS-CHECK" path="server/src/damage/verify.ts">
            Each scenario's key figure is re-computed by <b>Wolfram|Alpha</b> and compared —
            two independent systems agreeing on every dollar shown.
          </Box>
        </div>
        <Down />
        <Box title="④ THE EVIDENCE FILE" path="client/src/pages/Debrief.tsx">
          Findings + damage merge into the annotated replay: margin tactic stamps, outcome
          chips, buried fees un-redacting on scroll, and one number in red.
        </Box>
      </div>

      <div className="mt-10 paper-card p-4 border-l-4 border-l-redink">
        <p className="stamp-text text-[11px] font-bold">⑤ THE SCAM FACTORY — THE MOAT</p>
        <p className="font-mono text-[10px] text-ink/40 mt-0.5">server/src/scripts/scamFactory.ts</p>
        <p className="text-sm mt-1.5 leading-snug text-ink/80">
          <code className="font-mono text-xs bg-ink text-paper-bright px-1.5 py-0.5 rounded-sm">
            npm run scam-factory -- "&lt;FTC alert text&gt;"
          </code>{" "}
          — one command turns a real scam alert into a fully playable adversary: persona,
          playbook, offline fallback, and a frozen deterministic damage spec, validated and
          live in about a minute. New scams are content ops, not engineering. Our fifth
          adversary, <b>The Toll Text</b>, was born this way.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 items-center">
        <Link to="/gauntlet" className="btn-ink px-4 py-2 text-xs">
          See it run →
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink/40">
          React + TS + Vite · Express + tsx · SQLite + Drizzle · Anthropic API (SSE) · Recharts · Framer Motion
        </p>
      </div>
    </div>
  );
}

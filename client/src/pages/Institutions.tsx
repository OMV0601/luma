import { Link } from "react-router-dom";

/**
 * The business model, inside the product. B2B pitch page for credit unions,
 * banks, and school districts — same case-file voice as the rest of the app.
 */

const STREAMS = [
  {
    tag: "PRIMARY — B2B",
    title: "Credit unions & banks",
    body: "Banks increasingly reimburse scammed customers — scam losses are a P&L line now, not a PR problem. FoolProof ships as a member benefit: train members on the exact imposter-call pattern driving reimbursements, before the call comes.",
    terms: "Per-member-per-year licensing · white-label scenario packs (your brand as the impersonated entity — that's who scammers actually impersonate)",
  },
  {
    tag: "SECONDARY — B2B",
    title: "Schools & districts",
    body: "A growing majority of U.S. states mandate a personal-finance course for graduation — a budgeted, mandated buyer. The Dream Internship and First Credit Card scenarios meet students where the scams actually find them: their DMs.",
    terms: "Per-seat district licensing · the Evidence File doubles as gradeable coursework",
  },
  {
    tag: "TOP OF FUNNEL — B2C",
    title: "Consumers",
    body: "The core Gauntlet stays free. Premium adds a new adversary drop monthly — our content pipeline mirrors FTC alerts — plus difficulty tiers and family accounts. Train your parents: adults 50+ reported $4.3B in losses, the single most exposed group.",
    terms: "Freemium · $4/mo premium · family accounts",
  },
];

export default function Institutions() {
  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-10 pb-16">
      <p className="stamp-text text-xs text-redink font-semibold">FOOLPROOF FOR INSTITUTIONS</p>
      <h1 className="font-display text-3xl md:text-5xl leading-[1.05] mt-3 max-w-2xl">
        SIMULATED FRAUD IS THE NEW SIMULATED PHISHING.
      </h1>
      <p className="mt-5 text-lg text-ink/80 max-w-2xl">
        KnowBe4 built a multi-billion-dollar category training <em>employees</em> with fake
        phishing emails. FoolProof is the same playbook for your <em>customers</em> — adversarial
        training against the scams that end in reimbursement checks.
      </p>

      {/* The wedge */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <div className="paper-card p-4">
          <p className="stamp-text text-[10px] font-semibold text-ink/50">REPORTED FRAUD, 2025</p>
          <p className="font-display text-3xl text-redink mt-1 tabular">$15.9B</p>
          <p className="text-xs text-ink/60 mt-1">FTC — up 27% year over year</p>
        </div>
        <div className="paper-card p-4">
          <p className="stamp-text text-[10px] font-semibold text-ink/50">IMPOSTER SCAMS ALONE</p>
          <p className="font-display text-3xl text-redink mt-1 tabular">$3.5B</p>
          <p className="text-xs text-ink/60 mt-1">
            the costliest start exactly like our Fraud Alert scenario
          </p>
        </div>
        <div className="paper-card p-4">
          <p className="stamp-text text-[10px] font-semibold text-ink/50">TRUE CONSUMER COST</p>
          <p className="font-display text-3xl text-redink mt-1 tabular">~$200B</p>
          <p className="text-xs text-ink/60 mt-1">FTC's own estimate including underreporting</p>
        </div>
      </div>

      {/* Revenue streams */}
      <section className="mt-10" data-tour="streams">
        <h2 className="stamp-text text-sm font-bold">THREE REVENUE STREAMS</h2>
        <div className="mt-3 space-y-4">
          {STREAMS.map((s) => (
            <article key={s.title} className="paper-card p-5">
              <p className="stamp-text text-[10px] font-bold text-redink">{s.tag}</p>
              <h3 className="font-display text-xl mt-1">{s.title}</h3>
              <p className="text-sm text-ink/80 mt-2 leading-snug max-w-2xl">{s.body}</p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink/50 mt-3">
                {s.terms}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Illustrative pilot tile */}
      <section className="mt-10">
        <h2 className="stamp-text text-sm font-bold">WHAT A PILOT REPORTS</h2>
        <div className="paper-card mt-3 p-5 relative overflow-hidden">
          <span className="absolute top-3 right-3 stamp-text text-[9px] font-bold text-amber border-2 border-amber rounded-sm px-1.5 py-0.5 rotate-[4deg]">
            ILLUSTRATIVE
          </span>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="stamp-text text-[10px] font-semibold text-ink/50">MEMBERS TRAINED</p>
              <p className="font-display text-3xl mt-1 tabular">237</p>
            </div>
            <div>
              <p className="stamp-text text-[10px] font-semibold text-ink/50">
                SIMULATED LOSSES PREVENTED
              </p>
              <p className="font-display text-3xl text-verified mt-1 tabular">$61,400</p>
            </div>
            <div>
              <p className="stamp-text text-[10px] font-semibold text-ink/50">
                CAUGHT THE IMPOSTER CALL, ROUND 2
              </p>
              <p className="font-display text-3xl text-verified mt-1 tabular">78%</p>
            </div>
          </div>
          <p className="text-xs text-ink/60 mt-4 max-w-2xl">
            Every number in a member's Evidence File comes from the deterministic damage engine —
            which means every number in your program report does too. Training outcomes you can put
            in front of a board, not vibes.
          </p>
        </div>
      </section>

      {/* Why this scales */}
      <section className="mt-10">
        <h2 className="stamp-text text-sm font-bold">WHY THIS SCALES</h2>
        <div className="paper-card mt-3 p-5">
          <ul className="space-y-2 text-sm text-ink/80">
            <li className="border-l-4 border-ink/30 pl-3">
              <strong>Scenarios are JSON, not code.</strong> A scam that hits the news becomes a
              playbook in a day — content ops, not engineering.
            </li>
            <li className="border-l-4 border-ink/30 pl-3">
              <strong>The referee and damage engines are shared infrastructure</strong> across every
              scenario — white-label packs reuse the whole grading stack.
            </li>
            <li className="border-l-4 border-ink/30 pl-3">
              <strong>Stateless HTTP API, SQLite → Postgres is a dialect swap.</strong> One Drizzle
              config change and the same schema runs managed Postgres behind a load balancer.
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/play?scenario=fraudcall" className="btn-ink">
          Run the imposter-call demo
        </Link>
        <Link to="/" className="btn">
          Back to FoolProof
        </Link>
      </div>
    </div>
  );
}

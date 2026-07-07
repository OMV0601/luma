# 🗂️ FoolProof

**Get scammed here, so it never happens out there.**

Financial literacy is taught passively — articles, videos, quizzes — but money is lost *actively*: a convincing person, in the moment, talks you into a bad decision. Americans reported **$15.9B in fraud losses in 2025** (FTC), and that excludes the perfectly legal traps: payday rollovers, buried lease clauses, F&I upsells. FoolProof is an **adversarial training simulator**: AI characters actively try to exploit you in realistic scenarios, and after every round an independent referee produces an annotated **Evidence File** of the conversation — every manipulation attempt highlighted, labeled, and priced in real dollars by deterministic financial math.

## The Gauntlet (three playable adversaries)

| Case | Adversary | The con | Exposure |
|---|---|---|---|
| 🤝 **Quick Cash Danny** | payday lender | "$15 per $100" hiding 391% APR + the rollover cycle + the $600 upsell | $300–450 |
| 📞 **The Fraud Alert** | fake bank security caller (**voice mode**) | the "secure account" transfer, badge numbers, don't-hang-up isolation | $4,800 |
| 🏠 **The Lease Signing** | landlord with a poisoned lease | a real 18-clause document with 3 planted clauses you must find | $2,850 |

## Architecture — why this isn't a wrapper

```
                       ┌─────────────────────────────┐
   user message ─────► │ ADVERSARY ENGINE            │ persona + JSON playbook
                       │ Claude (SSE streaming)      │ (beats, concessions,
                       │ or scripted state machine   │  guardrails — DATA, not code)
                       └────────────┬────────────────┘
                                    │ hidden [[beat:bN]] marker → beat tracking
   decision ─────────► ┌─────────────────────────────┐
   (+ user's flags)    │ AI REFEREE (independent)    │ strict-JSON findings:
                       │ second model call, or       │ caught / resisted / fell_for
                       │ deterministic offline grader│ per playbook beat
                       └────────────┬────────────────┘
                                    ▼
                       ┌─────────────────────────────┐
                       │ DAMAGE ENGINE — no AI       │ unit-tested TypeScript:
                       │ server/src/damage/*.ts      │ APR, rollovers, clause costs,
                       │ 13 vitest tests             │ unrecoverable transfers
                       └─────────────────────────────┘
```

1. **The scammer never grades its own exam.** The referee is a separate model call that receives the transcript, the 10-tactic taxonomy, the playbook's ground-truth beats, and the user's live flags — and returns strict JSON.
2. **The money math is engineered, not generated.** Every dollar in a debrief comes from pure functions in [`server/src/damage/`](server/src/damage/), locked by unit tests (`npm test`). The CFPB payday formula, lease clause totals, amortized comparisons — the AI never invents a number.
3. **Playbooks are JSON, not code.** A new scam that hits the news becomes a new scenario in a day — content ops, not engineering ([`server/src/seed.ts`](server/src/seed.ts)).
4. **The full loop works offline.** No API key? Each adversary runs as a scripted state machine (20+ lines, keyword-triggered branches for APR questions, pushback, leaving) and a deterministic grader scores the round. The demo cannot break.

### The Call It Out mechanic

During a round, flag any adversary message and name the tactic (10-tactic taxonomy in [`shared/tactics.ts`](shared/tactics.ts)). Correct flags = **caught in the act**; wrong flags stamp **UNFOUNDED**. In the lease case, tapping a clause in the embedded document challenges it on the record — challenged clauses drop out of the damage math.

## Run it

```bash
npm install
copy server\.env.example server\.env    # add ANTHROPIC_API_KEY (optional — see below)
npm run dev                             # server :3001 + client :5173
```

Open **http://localhost:5173**. Judge Mode: **http://localhost:5173/play?scenario=payday|fraudcall|lease** — instant guest session, zero setup.

- **With `ANTHROPIC_API_KEY`**: adversaries are live Claude characters (streamed, beat-tracked).
- **Without**: scripted adversaries run the same playbooks — full loop, fully offline.

```bash
npm test          # 13 damage-engine unit tests
npm run build     # production build (Express serves client/dist on :3001)
```

## Stack

React 18 + TypeScript + Vite · Tailwind (case-file design tokens) · Framer Motion (redaction reveals, stamp spring-ins, damage count-up) · Recharts (Street Smarts radar) · TanStack Query · Express + tsx · SQLite via better-sqlite3 + Drizzle · Anthropic Messages API with SSE streaming · browser SpeechSynthesis/SpeechRecognition for voice mode.

## Business model

**The wedge stat:** FTC-reported fraud hit a record **$15.9B in 2025** (+27% YoY); imposter scams alone were $3.5B — and the costliest ones start exactly like our Fraud Alert scenario. Including underreporting, FTC's own estimate of true consumer cost approaches **$200B/yr**.

1. **Credit unions & banks (B2B, primary).** Banks increasingly reimburse scammed customers — scam losses are a P&L line now, not a PR problem. FoolProof licensed as a member benefit is measurable loss-prevention: train members on the exact imposter-call pattern driving reimbursements. **Comp: KnowBe4** built a multi-billion-dollar business on simulated phishing for employees; we are simulated fraud for customers. Per-member-per-year licensing + white-label scenario packs (the FI's own brand as the impersonated entity — that's who scammers actually impersonate).
2. **Schools (B2B, secondary).** A growing majority of U.S. states mandate a personal-finance course for graduation — a budgeted, mandated buyer. Per-seat district licensing; the Evidence File doubles as gradeable coursework.
3. **Consumers (freemium, top of funnel).** Free: the core Gauntlet. Paid ($4/mo): a new adversary drop monthly (our content pipeline mirrors FTC alerts), difficulty tiers, family accounts — train your parents: adults 50+ reported $4.3B in losses, the single most exposed group.

**Moat / scalability:** playbooks are JSON; referee + damage engines are shared infrastructure across all scenarios; SQLite→Postgres is a Drizzle dialect swap; the API is stateless HTTP and scales horizontally.

## Repo tour

```
shared/tactics.ts             the 10-tactic taxonomy (one source of truth)
server/src/
  seed.ts                     3 scenarios: personas, playbooks, lease doc, fallback trees
  adversary/prompt.ts         playbook -> system prompt scaffold
  adversary/llm.ts            Claude streaming + hidden beat-marker parsing
  adversary/scripted.ts       offline state machine (same interface)
  referee.ts                  independent grader (LLM strict-JSON + offline fallback)
  damage/{payday,fraudcall,lease}.ts   deterministic engines + damage.test.ts
  routes.ts                   auth, rounds, SSE messages, flags, decide, debrief, profile
client/src/
  pages/Round.tsx             chat, flag mechanic, decisions, voice phases
  pages/Debrief.tsx           the Evidence File: margin stamps, redaction reveals, count-up
  components/CallScreen.tsx   incoming-call UI, waveform, tap-to-talk
  components/LeaseDoc.tsx     embedded lease, tap-to-challenge clauses
  pages/Profile.tsx           Street Smarts radar + Money Protected/Lost
```

## Five-minute video map (rubric order)

1. **Problem (0:00–0:45):** the $15.9B stat; "every other tool is an AI that helps you — ours try to rob you."
2. **Build (0:45–2:00):** the architecture diagram above; show `damage.test.ts` passing for two seconds; SSE streaming; offline fallback.
3. **Demo (2:00–4:00):** Danny hustle → flag one tactic live → take the loan → Evidence File un-redacts the rollover fees → Fraud Alert in voice mode, hang up correctly, "$4,800 PROTECTED".
4. **Scalability (4:00–4:30):** new scams = new JSON playbooks; Drizzle → Postgres; stateless API.
5. **Business (4:30–5:00):** the three streams, led by the KnowBe4 comp.

**Q&A weapon:** hand the judges `/play?scenario=payday` and offer them the chair.

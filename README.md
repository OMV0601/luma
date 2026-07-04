# 🛡 FoolProof

**Train your financial defenses by negotiating against AI scammers — lose fake money, not real money.**

Americans lost **$15.9 billion** to fraud last year, and financial literacy taught through passive lessons doesn't stick. FoolProof teaches through adversarial experience: you negotiate against AI-powered adversaries — a payday lender, a fake bank fraud-alert caller, a predatory landlord — each armed with real, documented manipulation tactics. After every round, you see exactly which traps you caught, which ones got you, and what your mistakes would have cost **in real dollars**, computed with real financial math.

## How it works — the dual-agent architecture

```
                       ┌──────────────────────────┐
  user message ──────► │  ADVERSARY agent          │  plays the scammer.
                       │  (Claude Opus 4.8)        │  persona + hidden tactic
                       │                           │  playbook (data, not code)
                       └────────────┬─────────────┘
                                    │ reply
                                    ▼
                       ┌──────────────────────────┐
                       │  REFEREE agent            │  independent classifier.
                       │  (Claude Opus 4.8,        │  tags every manipulation
                       │   structured outputs —    │  attempt against a 10-tactic
                       │   schema-guaranteed JSON) │  taxonomy, with exact quotes
                       └────────────┬─────────────┘
                                    │ annotations
                                    ▼
   round end ────────► ┌──────────────────────────┐
   (accept /           │  SCORING ENGINE           │  deterministic. no AI.
    walk away)         │  (plain JavaScript)       │  real APR & amortization math
                       │                           │  → dollars lost, grade, debrief
                       └──────────────────────────┘
```

Three properties matter:

1. **The referee is independent of the adversary** — the scammer never grades its own exam. It uses structured outputs (`output_config.format` with a JSON schema), so its verdicts are guaranteed parseable, never prompt-and-pray.
2. **Every dollar figure is deterministic.** The 391% payday APR, the rollover-cycle fees, the amortized fair-loan comparison, the lease clause totals — all computed in [`server/src/scoring/finance.js`](server/src/scoring/finance.js) with standard formulas (CFPB payday APR formula, standard amortization). The AI never invents a number.
3. **Scenarios are data, not code.** A scenario file defines a persona, a tactic playbook, concession rules, and traps with cost formulas ([`server/src/scenarios/`](server/src/scenarios/)). Adding a fourth adversary requires zero engine changes — that's the scalability story.

## The tactic taxonomy

Ten documented manipulation patterns, sourced from FTC fraud reports, CFPB payday-lending studies, and tenant-rights literature: urgency pressure, authority impersonation, fee burial, rate anchoring, false scarcity, isolation, sunk-cost pressure, reciprocity baiting, complexity flooding, reassurance framing. Defined once in [`server/src/taxonomy.js`](server/src/taxonomy.js) and shared by the adversary's playbook, the referee's classifier, and the debrief UI.

## The three MVP scenarios

| Scenario | Adversary | The traps | Exposure |
|---|---|---|---|
| **The Payday Loan Office** | Rick, QuickCash Plus | "$15 per $100" hiding 391% APR, the rollover cycle, auto-debit NSF fees, overdraft anchoring | ~$370 |
| **The Fraud Alert Call** | "Marcus," fake bank security | the "secure account" transfer, the verification-code handover, secrecy demands, a fictional deadline | $7,050 |
| **The First Apartment** | Diane, landlord | a real lease document with 3 buried clauses: $150/mo "amenity fee," +8% auto-renewal, $500 non-refundable "restoration fee" | ~$5,444 |

## Run it

```bash
# 1. install everything (npm workspaces)
npm install

# 2. add your Anthropic API key
cp server/.env.example server/.env      # then edit server/.env

# 3. run server (:3001) + client (:5173) together
npm run dev
```

Open **http://localhost:5173**, pick an adversary, and try not to get fooled.

> Windows note: `cp` → `copy server\.env.example server\.env`.

## Repo tour

```
server/
  src/
    index.js            Express API (sessions, messages, decision)
    config.js           Anthropic client + model selection
    taxonomy.js         the 10-tactic manipulation taxonomy
    agents/
      adversary.js      scammer roleplay agent (persona + playbook prompt)
      referee.js        classifier + end-of-round judge (structured outputs)
    scoring/
      finance.js        APR / amortization / fee math — deterministic
      score.js          verdicts + decision → dollars, awareness, grade
    scenarios/          one file per adversary: persona, playbook, traps, costs
    store.js            in-memory sessions (swap point for Postgres/Supabase)
client/
  src/
    App.jsx             home → chat → debrief state machine
    components/
      Home.jsx          scenario picker + lifetime protected/lost tally
      Chat.jsx          negotiation UI, Coach Mode toggle, lease document modal
      Debrief.jsx       trap verdicts, dollar costs, fair alternative, replay
```

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/scenarios` | scenario picker metadata |
| `GET /api/scenarios/:id/document` | the lease document |
| `POST /api/sessions` | start a round (returns scripted opening) |
| `POST /api/sessions/:id/messages` | user turn → adversary reply + referee annotations |
| `POST /api/sessions/:id/decision` | `accept` / `walk_away` → judged, scored debrief |

## Scoring rules (deterministic)

- Each trap has a dollar cost from the finance engine ($0 for framing traps).
- The referee grades each trap: **missed** (0 pts) / **spotted** (0.6) / **neutralized** (1.0) → awareness 0–100.
- **Accept** a predatory deal → you eat every non-neutralized trap's cost; score caps at 55.
- **Walk away** → nothing lost, everything protected; score = 40 + awareness × 0.6 (instinct counts, understanding counts more).
- Grades: A ≥ 90, B ≥ 80, C ≥ 68, D ≥ 55, else F.

## Business model (the 25% everyone forgets)

FoolProof is the **KnowBe4 of consumer finance** — phishing-simulation training is already a billion-dollar category for corporate email; we apply the same "train by attack" model to the $15.9B consumer-fraud problem.

- **B2B2C — banks & credit unions** license FoolProof as a member benefit. Scam losses cost institutions directly (reimbursements, support load, churn after a fraud event); a measurably scam-proofed member base is a hard-dollar ROI story. Per-member-per-month pricing.
- **B2B — school districts & universities**: 25+ US states now mandate personal-finance coursework; FoolProof is a turnkey, measurable module (the awareness score is the assessment).
- **B2C freemium**: 3 scenarios free, subscription for the full library + voice mode.

## Roadmap

- **Voice mode** for the fraud call (Deepgram + Twilio) — the scenario is already written for it.
- **Institution dashboard**: cohort awareness scores, most-missed tactics.
- **Multilingual adversaries** — scam scripts localize; so do ours.
- **Scenario marketplace**: consumer-protection orgs author scenarios in our data format.
- **Persistence**: swap `store.js` for Postgres; sessions are already stateless HTTP.

## Team notes for the demo video

- Rubric mapping: architecture & code walkthrough (Technical, 25%) → this README + `agents/`; adversarial-training concept + Coach Mode (Innovation/UX, 25%); business model above (Business, 25%); live demo — let a judge play the fraud call (Communication, 25%).
- The referee's annotations are hidden during play by default (training wheels off) — flip **Coach Mode** on camera to show real-time tactic detection.

# FoolProof — Live Q&A Defense Sheet

Round 2 is a live demo + technical defense. These are the questions worth rehearsing.
Rule of thumb: answer in two sentences, then offer to show the code.

---

### 1. "Isn't this just a ChatGPT wrapper?"

Three engines, and only one of them is generative. The adversary is an LLM driven by a JSON
playbook with ground-truth beats; the referee is a *separate* model call that grades against
that ground truth and returns strict JSON; and every dollar figure comes from deterministic
TypeScript with 24 unit tests — cross-checked by Wolfram|Alpha. Kill the API key and the
entire loop still runs on a scripted state machine. A wrapper can't do that.
**Show:** `server/src/damage/`, `npm test`, then pull the `.env` key and play a round.

### 2. "How do you stop the AI from grading its own conversation?"

Structurally. The adversary and referee are different calls with different prompts; the
referee receives the playbook's ground truth (which tactics were supposed to run and where),
the transcript, and the user's flags. The scammer never sees the rubric; the referee never
plays the scammer. **Show:** `server/src/referee.ts` — the grading rules block.

### 3. "How do you know the money numbers are right?"

They're not generated — they're computed. The payday engine implements the CFPB fee
structure ($15/$100, 14-day terms, rollover cycle → 391.07% APR); the internship engine
implements the Reg CC provisional-credit timeline. Each is a pure function under vitest, and
each scenario's key computation is independently re-run by Wolfram|Alpha at debrief time —
if the numbers ever disagreed, the badge wouldn't render. **Show:** the badge + `verify.ts`.

### 4. "What stops the adversary from saying something harmful or being jailbroken?"

Playbook guardrails are injected into the system prompt (never request real personal data,
never break character, react in-character to prompt-injection attempts), replies are capped
at 110 words, and the fiction is explicitly consented to — the user chose to face a training
adversary. The referee sees the full transcript afterward, so any drift is visible in the
Evidence File. And the damage engine means the AI can never invent a scarier number than
the truth.

### 5. "Why would a teenager use this more than once?"

Because losing feels like a story, not a lecture. The Evidence File is a personalized
artifact — your conversation, annotated, with the money you'd have lost counted up in front
of you. Then Street Smarts tracks your catch-rate per tactic across rounds (the radar), the
Codex unlocks as you encounter tactics, and each scenario has three endings worth replaying
for (take / negotiate / walk — CASE CLOSED vs MARK stamps).

### 6. "How does this scale — content and load?"

Content: a scenario is JSON (persona, beats, concessions, fallback tree) plus a small
damage function. The Dream Internship was added in a day with zero engine changes. Load:
stateless HTTP API, sessions in SQLite (a Drizzle dialect swap away from Postgres), SSE
streaming per request — horizontal scaling is boring, which is the goal.

### 7. "What's the actual business, not the hackathon story?"

KnowBe4 for consumers. Banks reimburse scam victims now — losses are a P&L line — so we
license per-member as measurable loss prevention, with white-label packs impersonating the
bank's own brand (that's who scammers impersonate). Schools are the second stream: most
states mandate personal-finance coursework, and our Evidence File is gradeable. Freemium
consumers are the funnel. **Show:** `/for-institutions`.

### 8. "What about accessibility?"

It's a focus area, and ours is load-bearing: the lease scenario ships a plain-English
translator for every clause (jargon is where the money hides — translation *is* the
anti-scam), voice mode has always-on captions and a typed fallback, the whole app runs on
Atkinson Hyperlegible with one toggle, and every dialog is keyboard-navigable with visible
focus. Reduced-motion users get instant reveals instead of animations.

### 9. "What was the hardest technical problem?"

Streaming the adversary while hiding its control channel. The model appends a hidden
`[[beat:bN]]` marker so the server can track playbook progress, but we stream tokens live —
so the SSE writer holds back a 14-character tail until it's sure the tail isn't the start of
the marker, then strips it before persisting. Second place: making the offline fallback
*identical in shape* to the live path (same SSE frames, same referee output schema), so the
UI cannot tell which engine it's talking to.

### 10. "What would you build next?"

The two teen scenarios already spec'd (The Flip — DM crypto doubling; First Credit Card —
deferred-interest trap), difficulty tiers where adversaries get subtler as your catch-rate
rises, and the white-label pack tooling — a playbook editor so a credit union's fraud team
can write scenarios without touching code.

---

## Live-demo kit

- `npm run seed:reset && npm run dev` — clean state, ports auto-freed
- Judge links: `/play?scenario=internship` (hand them the chair), `/play?scenario=fraudcall` (voice)
- If wifi dies: pull the API key, say the line — "the demo cannot break" — and keep playing
- If a page ever errors: it renders a case-file card with a way back, not a white screen

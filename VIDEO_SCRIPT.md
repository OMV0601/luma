# FoolProof — 5-Minute Video Script

**Rubric this is built to win (each 25%):** Technical Execution · Innovation & UX · Business & Finance · Communication. Round-1 asks the video to cover: **The Problem · The Build · The Demo · Scalability.** This script hits all four in the rubric's own order, and folds Business in at the end.

**Total budget: 5:00.** Times are cumulative. Rehearse until the demo beats land without waiting on the model — see the pre-flight checklist at the bottom.

**Golden rule for filming:** record the demo segments *live* against a warm server (see checklist), but have a backup screen recording of a clean run in your pocket. If anything stalls on camera, cut to the recording — never let dead air sit.

---

## COLD OPEN — the hook (0:00–0:20)

> **On screen:** the Fraud Alert *incoming-call screen*, phone ringing. Answer it. Two lines of the caller playing you ("…two card-present transactions out of Miami… for your security, have you authorized any purchases in Florida tonight?").

**VO (over the call):**
> "This is what losing money actually sounds like. Not a bad budgeting decision — a real person, on the phone, walking you into it. In 2025, Americans reported **$15.9 billion** in fraud losses. Financial literacy apps teach you to *read* about this. They don't teach you to survive it."

> **On screen:** hang up. Cut to the FoolProof title card.

**VO:**
> "So we built the opposite of a literacy app. FoolProof is a room full of AIs that try to rob you — safely."

*(~20s. This is the line judges will remember. Say it clean.)*

---

## THE PROBLEM (0:20–0:50)

> **On screen:** the Welcome page — the three (now five) "wanted poster" adversary cards.

**VO:**
> "The financial world is gatekept by jargon and pressure: payday loans that hide a 391% rate behind '$15 per $100,' leases with clauses built to be skimmed, fake-bank calls engineered to panic you. The people hit hardest — young adults, gig workers, non-native speakers — are exactly the people passive lessons never reach. You don't build a reflex by reading. You build it by getting fooled once, safely, and seeing precisely how it happened. That's the whole idea: **train the reflex, not the vocabulary.**"

*(~30s.)*

---

## THE BUILD — "not a wrapper" (0:50–2:05)

> **On screen:** the **/architecture** page. Scroll it slowly as you talk — each box names a real file.

**VO:**
> "Three independent systems, and the design is the point. **One:** the adversary engine. Every scammer is a persona plus a JSON *playbook* — five manipulation tactics, escalation rules, and concessions: the accurate numbers the character is forced to admit if you ask the right question. Playbooks are data, not code."

> **On screen:** cut to a terminal, run `npm test`. Let the **27 passing tests** sit on screen for two full seconds.

**VO:**
> "**Two:** the money is engineered, not generated. Every dollar you'll see comes from pure functions — the CFPB payday formula, the fake-check clearing timeline, lease-clause totals — locked by 27 unit tests. The AI never invents a number. We even re-run each figure through Wolfram|Alpha as an independent check. **Three, and this is the part that matters:** a *separate* AI referee grades the round. The scammer never grades its own exam. It reads the transcript against the tactic taxonomy and returns structured JSON — caught, resisted, or fell for it — per tactic."

> **On screen:** quick cut showing the stack line at the bottom of /architecture.

**VO:**
> "React and TypeScript front to back, Express with server-sent events for the live stream, SQLite through Drizzle. And here's the safety net: with no API key at all, a scripted state machine runs the same playbooks — the entire app works offline. The demo cannot break."

*(~75s. The `npm test` shot and the "never grades its own exam" line are the two things a technical judge is watching for.)*

---

## THE DEMO (2:05–3:50)

### Beat 1 — Danny hustles you (2:05–2:55)

> **On screen:** `/play?scenario=payday`. You're mid-conversation with Quick Cash Danny. Type: *"How much do I pay back?"* — he answers "$15 per hundred." **Flag that message** live → pick **Fee Burial**. Then type: *"No — give me the actual APR."* He concedes ~391%. Take the loan anyway (the point is to lose, on camera).

**VO:**
> "I ask the cost. He says fifteen bucks per hundred — so I call it out, live: that's fee burial. When I push for the real number, he admits it: 391% APR. Watch — I'm going to take the loan anyway, the way a tired person at 5pm actually would."

### Beat 2 — the Evidence File (2:55–3:20)

> **On screen:** the debrief. Let the red damage number **count up**. Scroll so the **buried fees un-redact** — black bars peeling off to reveal the rollover cycle. Point to the CAUGHT / FELL FOR IT chips in the margin.

**VO:**
> "And here's why the app exists. The Evidence File: every tactic he used, stamped in the margin. The fees he buried, un-redacting as I scroll. And one number in red — what that 'favor' actually costs over the typical rollover cycle. I caught the fee burial. I fell for the rest."

### Beat 3 — the voice call, done right (3:20–3:50)

> **On screen:** `/play?scenario=fraudcall` on a phone or narrow window. The call rings (caller ID: FIRST NATIONAL BANK ⚠️). Answer — the caller *speaks*, the waveform moves while it talks and stills when it stops. Say "I'm hanging up and calling the number on my card." Hit **Hang up**. Land on "$4,800 PROTECTED."

**VO:**
> "Same engine, different channel — a voice call, because that's how the expensive scams actually arrive. The right move is the boring one: hang up, call the number on your card. Do it, and the Evidence File shows what your instinct just saved you."

*(~105s. Rehearse Beat 1's flag-then-push sequence until it's muscle memory — it's the single most important 20 seconds in the video.)*

---

## SCALABILITY — the Scam Factory (3:50–4:30)

> **On screen:** split view — a real FTC "unpaid toll text" alert on one side, a terminal on the other. Run:
> `npm run scam-factory -- alert.txt`
> Let the receipt print (the beat table, the damage total, the play URL).

**VO:**
> "Now — scale. A new scam hits the news. Watch what it takes to ship it. This is a real FTC alert about the toll-text scam. One command… and the factory writes a complete new adversary: persona, a five-tactic playbook, an offline fallback, and a deterministic damage model — validated and live."

> **On screen:** open `/play?scenario=the-toll-text`. Play one line.

**VO:**
> "This scammer did not exist sixty seconds ago. That's the moat: new scams are content, not engineering. Our referee and our money math are shared infrastructure — every new scenario inherits them for free. More scenarios, more users, same three systems. SQLite becomes Postgres with a one-line dialect swap; the API is stateless and scales sideways."

*(~40s. This is your Innovation crescendo — no other team will show a scenario being *born* on camera.)*

---

## BUSINESS (4:30–5:00)

> **On screen:** the **/for-institutions** page.

**VO:**
> "Who pays? This is **KnowBe4 for consumers** — simulated phishing built a multi-billion-dollar business training *employees*; we train everyone else. **One:** banks and credit unions license it as a member benefit — scam reimbursement is a real line on their P&L now, and we're measurable loss-prevention, white-labeled to the brand scammers actually impersonate. **Two:** schools — most US states now mandate a personal-finance course, and our Evidence File is gradeable coursework. **Three:** consumers, four dollars a month, a new adversary every month as the scams evolve. We turn the $15.9 billion problem into a trainable skill — and hand institutions a number that proves it worked."

> **On screen:** end card — the QR code. "GET SCAMMED YOURSELF." + the live URL.

**VO (last line):**
> "Scan it. See how long *you* last."

*(~30s. Land exactly on 5:00.)*

---

## PRE-FLIGHT CHECKLIST (do this before you hit record)

1. **Warm the server.** If deployed, open the live URL 2–3 minutes early (free tier sleeps). If local, `npm run dev` and confirm both the blue `[server]` line **and** `[adversary] live — Anthropic API key found` appear.
2. **Clean slate.** `npm run seed:reset` — fresh gauntlet, "UNPLAYED" stamps, zeroed tallies.
3. **Confirm the toll scenario exists** for the Scalability beat (it's committed in `server/src/generated/`), OR regenerate it live as the shot itself — your call. If regenerating live, have `alert.txt` ready in the repo root.
4. **Rehearse Beat 1** (flag Fee Burial → push for APR → take the loan) five times. It must not hesitate.
5. **Voice check** in **Chrome** — mic permission granted, system volume up, a good en-US voice installed.
6. **Backup recording** of one clean run of each demo beat, in case the live take stalls.
7. **Narrow the window to phone width** for the voice-call beat so it reads as a phone.

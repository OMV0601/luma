# SCRIPT.md — FoolProof Submission Video (3 presenters, Google Meet, one take)

**Answer to the setup question first: yes, three people on a Meet with one shared screen works — teams win hackathons with exactly this rig.** But free Google Meet has no record button, latency makes people talk over each other, and screen-share audio (the scammer's VOICE and the ring tone — you need these in the video) doesn't come through unless you set it up right. The rig below fixes all three. Follow it exactly.

---

## PART 1 — THE RIG (set up before anyone says a word)

### Roles

| Role | Who | Job |
|---|---|---|
| **DRIVER** | The teammate with the **best internet + the repo running locally** | Shares screen, does every click, narrates the demo beats (mouse and voice must be the same person — latency makes narrating someone else's clicks impossible) |
| **ARCHITECT** | Most technical teammate | The Build section + Scam Factory narration |
| **CLOSER** | Best storyteller | Cold open, Problem, Business, final line |

### Recording (do NOT rely on Meet's record button — free accounts don't have one)

1. **The DRIVER records locally with OBS** (free, 10-min setup): one scene with **Display/Window capture** (the browser) + **Desktop Audio** (captures the app's ring tone + TTS voice *and* teammates' voices coming through Meet) + **Mic** (driver's own voice). Output 1080p, 30fps. This local file IS the submission video — Meet is just the phone line connecting you three.
2. In Meet, everyone uses **headphones** (no echo), and **mutes when not speaking**.
3. Driver: **full-screen the browser**, hide the Meet window on a second monitor or behind, **turn on Do Not Disturb / Focus Assist**, hide bookmarks bar, close every other tab.
4. Do **two full takes** back to back. Keep the better one. If you have any editor at all, you can also splice the best sections of each.

### Pre-flight (driver's machine, 10 minutes before)

- [ ] `npm run dev` — confirm BOTH lines: `[server] FoolProof API on :3001` and `[adversary] live — Anthropic API key found`
- [ ] `npm run seed:reset` — clean gauntlet, UNPLAYED stamps, zero tallies
- [ ] Chrome, system volume up, one test TTS play of the fraud call (mic permission pre-granted)
- [ ] A file `alert.txt` in the repo root containing a real, *different* FTC scam alert (not the toll one — grab a current one, e.g. the fake-job or QR-code parking scam, ~10 lines of text). This is for the live Scam Factory shot.
- [ ] Terminal open, font size bumped to ~18pt, ready in the repo root
- [ ] Tabs pre-opened in order: `localhost:5173/play?scenario=fraudcall` · `/` (welcome) · `/architecture` · `/play?scenario=payday` · `/for-institutions` · end-card image
- [ ] Run the self-driving tour once end-to-end: Welcome → **▶ Watch it demo itself** (16 steps, ~3 min, it plays a real round). It must be green — it's your nuclear fallback (below) and the judges' leave-behind.
- [ ] Timer visible to the driver only (phone propped up)

### The three speaking rules (latency insurance)

1. **Hard handoff cues.** Each section ends with a scripted final sentence — the next speaker starts ONLY after hearing it, plus one beat of silence. Never jump in early.
2. **One voice per section.** No back-and-forth banter — it dies over intercontinental lag.
3. If someone freezes or drops: the DRIVER owns every line as understudy. Keep rolling; fix in take two.

---

## PART 2 — THE SCRIPT (5:00 total)

> Format: **[SCREEN]** = what the driver shows/does. **Bold name** = who speaks. Spoken lines are word-for-word — rehearse until they're yours, then say them like you didn't.

---

### 0:00–0:20 · COLD OPEN — **CLOSER**

**[SCREEN]** The Fraud Alert incoming-call screen, ringing (caller ID: FIRST NATIONAL BANK ⚠️). Driver answers. Let the caller speak ~2 lines out loud ("…two card-present transactions out of Miami…").

**CLOSER** (over the call):
> "This is what losing money actually sounds like. Not a bad budget — a voice, on the phone, walking you into it. Last year Americans reported **fifteen-point-nine billion dollars** in fraud losses. Literacy apps teach you to *read* about this. Nobody teaches you to survive it."

**[SCREEN]** Driver hangs up. Cut to the Welcome page.

**CLOSER:**
> "So we built the opposite of a literacy app. **FoolProof is a room full of AIs that try to rob you — safely.**"

*(← handoff cue: "…rob you, safely.")*

---

### 0:20–0:50 · THE PROBLEM — **CLOSER**

**[SCREEN]** Welcome page. Slow scroll across the five wanted-poster cards.

**CLOSER:**
> "The financial world runs on jargon and pressure: a payday loan hiding a 391-percent rate inside 'fifteen dollars per hundred,' a lease with clauses built to be skimmed, a fake bank call engineered to panic you. The people hit hardest — young adults, gig workers, non-native speakers — are exactly who passive lessons never reach. You don't build a reflex by reading. You build it by getting fooled once, *safely*, and seeing exactly how it happened."

*(← handoff cue: "…exactly how it happened.")*

---

### 0:50–2:00 · THE BUILD — **ARCHITECT**

**[SCREEN]** `/architecture` page. Driver scrolls one box at a time, matching the words.

**ARCHITECT:**
> "Three independent systems — and the separation is the point. **One: the adversary engine.** Every scammer is a persona plus a JSON *playbook*: five documented manipulation tactics, escalation rules, and concessions — the accurate numbers the character must admit if you ask the right question. Playbooks are data, not code."

**[SCREEN]** Driver switches to the terminal, runs `npm test`. Hold on **27 passed** for two full seconds.

**ARCHITECT:**
> "**Two: the money is engineered, never generated.** Every dollar you'll see comes from pure functions — the CFPB payday formula, the fake-check clearing timeline — locked by twenty-seven unit tests, and cross-checked against Wolfram Alpha. The AI cannot invent a number. **Three:** a *separate* AI referee grades every round against the tactic taxonomy — caught, resisted, or fell for it. **The scammer never grades its own exam.** And with no API key at all, scripted state machines run the same playbooks — the entire product works offline. This demo cannot break."

**[SCREEN]** While saying that last line, the driver types — visibly — `npm run scam-factory -- alert.txt` in the terminal and **hits Enter. Leave it running.** Say nothing about it yet.

*(← handoff cue: "…cannot break." — and the mysterious command is now cooking in the background. It needs ~90 seconds; the demo covers it.)*

---

### 2:00–3:45 · THE DEMO — **DRIVER** (narrating their own clicks)

**Beat 1 — Danny (2:00–2:50).** **[SCREEN]** `/play?scenario=payday`. Type: *"How much do I pay back?"* → Danny says "$15 per hundred." **Flag the message → Fee Burial.** Type: *"No. Give me the actual APR."* → he concedes ~391%. Click **TAKE THE LOAN**.

**DRIVER:**
> "I ask what it costs. 'Fifteen bucks per hundred' — that's a tactic, so I flag it, live: *fee burial*. I push, and he folds: three-hundred-ninety-one percent APR. Notice the three ways out — take it, *negotiate* it, or walk. Avoidance isn't the lesson; recognition is. But it's five p.m. and my car is dead… so I do what tired people do. I take the loan."

**Beat 2 — Evidence File (2:50–3:15).** **[SCREEN]** The debrief: red number counts up; scroll so the buried rollover fees **un-redact**; point at CAUGHT / FELL FOR IT stamps.

**DRIVER:**
> "And this is why the app exists: the Evidence File. Every tactic stamped in the margin. The fees he buried — literally un-redacting as I scroll. One number in red: what that favor costs on the typical rollover cycle. I caught one tactic. I fell for the rest. Now I know which ones get me."

**Beat 3 — the call, answered right (3:15–3:45).** **[SCREEN]** `/play?scenario=fraudcall`, window narrowed to phone width. Ring → answer → caller speaks, waveform moving. Driver clicks the mic (or types): *"I'm hanging up and calling the number on my card."* → **HANG UP** → "$4,800 PROTECTED."

**DRIVER:**
> "Same engine, different channel — voice, because that's how the expensive scams actually arrive. The winning move is the boring one: hang up, call the number on your card. Four thousand eight hundred dollars — protected. That reflex is the product."

*(← handoff cue: "…that reflex is the product.")*

---

### 3:45–4:30 · SCALABILITY — THE SCAM FACTORY — **ARCHITECT**

**[SCREEN]** Driver switches to the terminal from 2:00. The factory receipt is sitting there finished: beat table, damage total, play URL.

**ARCHITECT:**
> "Four minutes ago, you watched us paste a real FTC scam alert into one command. While we were demoing — it shipped. One model call drafts the persona, the five-tactic playbook, an offline fallback, and a damage spec; **our code validates every field and freezes the math.** Look at the receipt: a complete new adversary."

**[SCREEN]** Driver opens the printed play URL, sends one message to the brand-new scammer.

**ARCHITECT:**
> "**This scammer did not exist when this video started.** That's the moat: new scams are content, not engineering — the referee and the damage engine are shared infrastructure every scenario inherits. Playbooks scale the library, stateless HTTP scales the users, and SQLite to Postgres is a one-line swap."

*(← handoff cue: "…one-line swap." · **Fallback:** if the live generation errored, open `/play?scenario=the-toll-text` instead and say "here's one it built yesterday from the FTC toll-scam alert" — the claim stays true.)*

---

### 4:30–5:00 · BUSINESS + CLOSE — **CLOSER**

**[SCREEN]** `/for-institutions`, then the end card (QR + live URL). *(The landing page behind that QR opens with **▶ Watch it demo itself** — a self-driving tour that plays a real round with spotlights and popup cards. After this video ends, the app is its own salesperson.)*

**CLOSER:**
> "Who pays? This is **KnowBe4 for consumers.** Simulated phishing built a multi-billion-dollar category training employees — we train everyone else. Banks and credit unions license it as a member benefit, because scam reimbursement is now a line on their P&L and we are measurable loss-prevention, white-labeled as the brand scammers actually impersonate. Schools second — personal finance is a graduation requirement in most states, and the Evidence File is gradeable coursework. Consumers are the funnel: four dollars a month, a new adversary every month, because the scams don't stop evolving — and now, neither do we."

**[SCREEN]** End card fills the screen. One beat of silence.

**CLOSER:**
> "That's FoolProof. **Scan the code — see how long you last.**"

*(END — land at 5:00.)*

---

## PART 3 — AFTER THE TAKE

- [ ] Watch the whole recording once: is the scammer's TTS voice audible? Is every speaker's audio clean? Did the un-redaction render on camera?
- [ ] Check total length ≤ 5:00 — trim dead air at the start/end; nothing else needs editing if the take was clean.
- [ ] Keep take two even if take one was good. Submit the better file.
- [ ] Same rig, same roles for live Q&A day — plus `QA_PREP.md` re-read out loud by all three, and two links pre-loaded to hand the judges: `/play?scenario=payday` (the chair) and the Welcome page's **▶ Watch it demo itself** (the guided tour — for the judge who'd rather watch than play).

**Timing insurance:** if a live model reply is slow during the demo, the DRIVER talks *over the wait* (the lines above are written to cover it) — never stand in silence watching a cursor. If anything hard-breaks mid-take: stop, `npm run seed:reset`, breathe, take two. That's what it's for.

**Nuclear option:** if the DRIVER can't drive at all (internet, hardware, nerves), open the Welcome page and click **▶ Watch it demo itself**. The app takes the cursor and runs the entire demo itself — types the probe question into a real round, flags the tactic, takes the deal, opens the Evidence File, ends on the business page — and it **pauses on every popup card until you click Next**, so the DRIVER (or any teammate) narrates at their own pace over the top. The demo literally cannot be fumbled: the product does the clicking.

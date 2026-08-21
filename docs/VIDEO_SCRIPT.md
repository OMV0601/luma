# FoolProof — 5-Minute Video Script (rubric-ordered)

> ⚠️ **SUPERSEDED — do not use for Open Atlas Demo Day.** This is the older LUMA-hackathon video script. For Fri Aug 21 use **pitch/FoolProof-Demo-Day-Script.docx** (the two-person run of show) and **docs/DEMO_DAY.md**.

Judging rubric: Technical Execution 25% · Innovation & UX 25% · Business & Finance 25% · Communication 25%.
Every section below is mapped to a criterion. Record at 1920×1080, browser at 100% zoom.
Run `npm run seed:reset && npm run dev` before recording. Practice the demo path twice first.

---

## 0:00–0:45 — THE PROBLEM (Communication + Innovation)

**On screen:** the Welcome page. Hero + evidence stack visible.

> "Last year Americans reported fifteen-point-nine billion dollars lost to fraud — a record,
> up 27% in one year. And that number misses the perfectly legal traps: payday rollovers,
> buried lease clauses, fake-check job offers.
>
> Here's the problem with how we teach financial literacy: it's passive. Articles, videos,
> quizzes. But money isn't lost passively — it's taken, by a convincing person, in a live
> conversation, in the moment.
>
> Every other finance tool is an AI that helps you. Ours try to rob you.
> This is FoolProof: get scammed here, so it never happens out there."

---

## 0:45–2:00 — THE BUILD (Technical Execution)

**On screen:** README architecture diagram, then split to code.

> "Three engines, strictly separated.
>
> One — the adversary: a Claude character driven by a JSON playbook. Beats, concessions,
> guardrails — data, not code. It streams over server-sent events, and a hidden beat marker
> in every reply lets the server track exactly which manipulation it's running.
>
> Two — the referee. The scammer never grades its own exam. A second, independent model
> call gets the transcript, our ten-tactic taxonomy, the playbook's ground truth, and the
> user's live flags — and returns strict JSON findings.
>
> Three — the damage engine. No AI at all. Every dollar you'll see is a pure TypeScript
> function — the CFPB payday formula, the Reg CC fake-check timeline —"

**On screen:** run `npm test`, show `24 passed` for two seconds.

> "— locked by twenty-four unit tests. And each scenario's key number is independently
> re-computed by Wolfram|Alpha and badged on screen.
>
> One more thing: kill the API key and the whole loop still runs — scripted adversaries,
> deterministic grading. This demo cannot break."

---

## 2:00–4:00 — THE DEMO (Innovation & UX)

**The demo track is the app itself.** On the Welcome page, click **▶ Watch the auto-demo**
and narrate over the self-driving tour. It takes the cursor, plays a REAL round (nothing
mocked), and **pauses on every popup card until you click Next** — so your narration sets
the pace, and there is nothing to fumble on camera.

**Path A — the tour drives The Dream Internship (2:00–3:30).**

> "Rather than tell you the UX is intuitive, we'll let the app demo itself — this tour is
> a feature, not a video edit. Everything you're about to see is live."

Click through, narrating over each spotlight (the popup cards carry the on-screen text;
your voiceover adds color — don't read them verbatim):

1. **Steps 1–3** (hero, WANTED wall): breeze through — you covered the problem already.
2. **THE SCENE / THE ADVERSARY**: *"The number-one scam hitting students: a dream-job DM.
   Jordan is an AI character on a beat-by-beat playbook."*
3. **CORNERED ON SPECIFICS** — the tour types the kill question itself: *"Watch it ask why
   equipment money routes through a personal account — and watch Jordan concede, because
   honest concessions are part of the playbook contract."*
4. **CALL IT OUT / CAUGHT IN THE ACT** — the tour flags the tactic live.
5. **WE TOOK THE DEAL — ON PURPOSE** → the Evidence File count-up to **-$2,165**, the
   bounce timeline un-redacting, the referee's margin stamps. *"Losing here is the product
   working. Every number: deterministic TypeScript, 34 tests, Wolfram-checked."*
6. Press **Esc** after THE TAPE step to exit the tour (you'll show business yourself at 4:30).

**Path B — The Fraud Alert, voice mode, driven by hand (3:30–4:00).** Navigate to
`/play?scenario=fraudcall`.

1. The phone rings full-screen. Answer it. Let the TTS voice read one line with live captions.
2. Say (or type): **"I'm going to hang up and call the number on my card."**
3. Tap **"Hang up & call my card."**
4. **CASE CLOSED — $4,800 PROTECTED.** *"Same engine, opposite outcome. That's the point:
   you get to make the mistake here, where it's free."*

If time allows (10s): flash the lease's **Plain English** toggle. *"And every document
scenario ships a jargon translator — plain language is the anti-scam."*

---

## 4:00–4:30 — SCALABILITY (Technical + Business)

**On screen:** `server/src/seed.ts` scrolling past the Jordan playbook, then `damage/index.ts`.

> "Scaling content: a new scam in the news becomes a new JSON playbook — the internship
> scenario you just watched was added in a day, no engine changes. Scaling load: the API is
> stateless HTTP; SQLite to Postgres is a one-line Drizzle dialect swap; sessions already
> live in the database, so servers restart without logging anyone out."

---

## 4:30–5:00 — BUSINESS (Business & Finance)

**On screen:** `/for-institutions`.

> "KnowBe4 built a multi-billion-dollar category on simulated phishing for employees.
> We're simulated fraud for customers. Banks now reimburse scam victims — that's a P&L
> line, and we're the loss-prevention for it: per-member licensing, white-label scenario
> packs in the bank's own brand. Second stream: schools — most states now mandate a
> personal-finance course, and our Evidence File doubles as gradeable coursework. Third:
> freemium consumers, four dollars a month, a new adversary every month, tracked to FTC alerts.
>
> FoolProof. Get scammed here — so it never happens out there."

---

## Recording checklist

- [ ] `npm run seed:reset` before each take (clean stamps, clean profile)
- [ ] Run the self-driving tour once end-to-end before recording (16 steps, all green)
- [ ] Server log visible for 2s during build section (`[adversary] scripted fallback` or `live`)
- [ ] Browser zoom 100%, window 1920×1080, bookmarks bar hidden
- [ ] Rehearse narrating over the tour once — click Next only when your line lands
- [ ] Voice mode: check system audio is captured; captions cover you if TTS is quiet
- [ ] Record Path B on a real Chrome (not headless anything)
- [ ] Keep a full spare take

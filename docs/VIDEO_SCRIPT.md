# FoolProof — 5-Minute Video Script (rubric-ordered)

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

**Path A — The Dream Internship (2:00–3:15).** Navigate to `/play?scenario=internship`.

> "This is the number-one scam hitting students right now — I'll play a high-schooler
> who just got a dream DM."

Script the round (practiced):
1. Read Jordan's opening aloud, fast. *"$350 a week, never applied — already suspicious, but it pays double lifeguarding."*
2. Type: **"Why would the equipment money go through my personal bank account?"** — show Jordan's "it IS a little unusual" concession.
3. Type: **"What if I wait for the check to fully clear first?"** — show the tell: *"the cohort can't be held ten business days."*
4. Flag Jordan's teller line with **Isolation** — show the ⚑ chip land.
5. Click **"Deposit it & pay the vendor"** — *"let's do what most people do."*
6. **The Evidence File.** Let the count-up run to **-$2,165**. Scroll slowly: the redaction bars peel off the bounce timeline. *"Day two: you Zelle real money. Day seven: the check bounces, the bank claws back all twenty-four-eighty — including your 'first week's pay,' which was never real. The referee stamps every move: caught, resisted, fell for it."*

**Path B — The Fraud Alert, voice mode (3:15–4:00).** Navigate to `/play?scenario=fraudcall`.

1. The phone rings full-screen. Answer it. Let the TTS voice read one line with live captions.
2. Say (or type): **"I'm going to hang up and call the number on my card."**
3. Tap **"Hang up & call my card."**
4. **CASE CLOSED — $4,800 PROTECTED.** *"Same engine, opposite outcome. That's the point: you get to make the mistake here, where it's free."*

If time allows (10s): flash the lease's **Plain English** toggle. *"And every document scenario ships a jargon translator — plain language is the anti-scam."*

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
- [ ] Server log visible for 2s during build section (`[adversary] scripted fallback` or `live`)
- [ ] Browser zoom 100%, window 1920×1080, bookmarks bar hidden
- [ ] Practice the internship round twice — the two probe questions must be typed fast
- [ ] Voice mode: check system audio is captured; captions cover you if TTS is quiet
- [ ] Record Path B on a real Chrome (not headless anything)
- [ ] Keep a full spare take

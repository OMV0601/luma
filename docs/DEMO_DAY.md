# DEMO DAY — Open Atlas AI for Social Good, Fri Aug 21 2026

**Format:** 5-min pitch + 5-min Q&A · presenting remotely over Zoom
**Judging:** Impact 25% · Creativity & Originality 25% · Technical Execution 25% · Feasibility 25%
**Target:** 1st Best Overall ($2,500) — with Best Financial Inclusion and Best Newcomer Settlement as the fallback nets we should also obviously win.

> ⚠️ Schedule conflict in the sources: the email says 10:00–12:00 with 5+5 per team; the Luma agenda says demos 10:15–11:15 and prizes at 11:15. **Confirm your slot length at 9:30 check-in.** The script below has a hard 3-minute core marked `[CORE]` — if they say "three minutes," cut everything marked `[CUT FIRST]` and you still land every criterion.

---

## PART 0 — THE ROOM (read this before you write a word of your own)

**Who Open Atlas is:** the community hub for 10,000+ high-skilled immigrants. Founded by immigrants, for immigrants. Their own words: *"the room every immigrant wishes they had on day one."* Day 2 of the summit is visa pathways and a legal lounge. **The judges in this room are, overwhelmingly, immigrants.**

**Who's judging (38 named).** The bench is engineers and operators, *not* VCs — so they probe technical substance and system design, not TAM. But four of them make FoolProof unusually well-aimed:

| Judge | Why they matter to us |
|---|---|
| **Nikin Tharan** — Open Atlas co-founder, **FINRA Registered Rep** | The most fraud-literate person in the room. He will know if a number is wrong. He will also *love* this if it's right. |
| **Narayan Pharkya** — Founder, TransferX (remittances) | Lives in payments fraud daily. |
| **Sanil Almeida** — CyberSecurity @ **Visa** | Card-fraud domain expert. |
| **Veeraj Gadda** — Solutions Manager @ **PayPal** | Same. |
| **Dhravya Shah** — Founder, **Supermemory** | Supermemory sponsors all three cash prizes. |

**What this means:** do not soften or round the fraud statistics. Cite FTC and say "reported." These people will fact-check in real time, and precision is our credibility.

**Organizer's stated bar:** *"The AI must be doing real work in your solution, not just decorative"* and *"Polish is not required. Clarity is."*

---

## PART 1 — THE STRATEGIC FRAME

### The one line that wins the room

> **"Every other team today built an AI that helps you. We built AI that tries to rob you."**

Twelve finalists. Eleven of them are assistants — copilots, summarizers, document readers, matchers. **We are the only adversarial system in the building.** Lead with it, because it scores Creativity & Originality (25%) in a single sentence and it reframes every pitch that came before us.

### The reframe that matters most

FoolProof was born as a general consumer-fraud trainer. **In this room it is a newcomer-protection tool**, and that is not a stretch — it's the truest version of the product:

- If you've been in the country 18 months, you don't know what a real USCIS letter looks like.
- You don't know that a *notary public* here is not a *notario* back home.
- You don't know your first lease is unusual, because you've never signed one here.
- **Scammers do not target the gullible. They target the people who don't know the rules yet.**

Lead the problem with that. It is the single most resonant thing we can say to this specific bench.

### The three things we have that the field does not

I researched all 12 rival finalists. These gaps are real and exploitable:

1. **A business model.** *Not one other finalist states a revenue model or GTM* — I checked all twelve. Kaktua claims freemium traction, but its Play Store listing shows "10+ downloads" against a claim of "hundreds of active users," which is the most fragile claim in the field. We have the KnowBe4 comparable, three named streams, and `/for-institutions` **shipped inside the product**. This is 25% of the score (Feasibility) that most of the room is forfeiting.
2. **A demo that cannot fail.** Every finalist has a polished recorded video — that's table stakes. What none of their pages shows is a demo that drives the **live** product by itself. On stage they either play a recording or gamble on a Render free-tier app cold-starting. Ours takes the cursor and plays a real round, and with the API key pulled it still runs offline. Say *"this isn't a recording"* — never *"they don't have videos."*
3. **Determinism in a room full of LLM wrappers.** Most of the field is OCR → LLM → summary. When a judge asks *"what happens when the model gets it wrong?"* — DocuPal, VERA, and Proofly have thin answers. Ours: **the AI never touches a number.** 27 unit tests, an independent referee, and a Wolfram cross-check.

### Where we are vulnerable — and the honest play

**FoolProof was built July 4–11 for a different hackathon.** Git history says so plainly: 18 of 19 commits land in that week. Judges are already probing this across the field (Kaktua is dual-submitted, ScholarPilot triple-submitted, Réunia was built in June–July).

**Do not hide it. Do not lead with it. Have this answer loaded and deliver it without flinching:**

> "Straight answer: the core platform was built in July for an earlier hackathon. What I built for Open Atlas is The Notario — because when I held our five scenarios up against *this* community, not one of them spoke to it. I authored it to our Scam Factory's own schema, ran it through the same validator, and it dropped straight in — **zero engine changes, zero new code.** That's not me patching a gap; that's the architecture's whole thesis working in front of you: **new scams are content, not code.**"

That converts our biggest liability into a live demonstration of our core technical claim. It is also simply true. If you get asked and you dodge, we lose the room — this bench respects candor and will smell a dodge instantly.

---

## PART 2 — THE 5-MINUTE SCRIPT

> Format: **[SCREEN]** = what you show. Spoken lines are word-for-word — rehearse until they're yours, then say them like you didn't. `[CORE]` = never cut. `[CUT FIRST]` = drop if you get 3 minutes.

### 0:00–0:35 · THE HOOK `[CORE]`

**[SCREEN]** FoolProof opening title slide (`pitch/deck.html`, fullscreen).

> "Every other team today built an AI that helps you.
>
> We built AI that tries to rob you.
>
> I'm [name], and this is FoolProof. It's a training simulator where you sit across from a scammer — a live AI character running a real, documented playbook — and they try to take your money. Safely. So that when the real one calls, you've already met them."

*(Beat. Let it land. Do not rush this.)*

### 0:35–1:20 · THE PROBLEM, AIMED AT THIS ROOM `[CORE]`

**[SCREEN]** Deck slide 2 — the $15.9B / $3.5B stat card.

> "Last year Americans reported **fifteen-point-nine billion dollars** lost to fraud. Three and a half billion of that was imposter scams alone. Those are the *reported* numbers — the FTC's own estimate of the real figure is many times higher, because most people never report it.
>
> But here's what matters in this room. Fraud doesn't target the gullible. It targets whoever doesn't know the rules yet.
>
> If you've been in this country eighteen months: you don't know what a real USCIS letter looks like. You don't know that a *notary public* here is not a *notario* back home. You've never signed an American lease, so you don't know yours is unusual.
>
> And every financial literacy tool we found is passive — articles, videos, quizzes. **Nobody loses seven thousand dollars to a quiz.** Money is taken in live conversation, by a convincing person, in the moment. You don't build a reflex by reading about one."

### 1:20–3:20 · THE LIVE DEMO `[CORE]` — two minutes, the heart of the pitch

**[SCREEN]** Switch to the app. Click **▶ Watch the auto-demo**. Narrate over it — do not read the popup cards aloud, add color instead.

> "So rather than tell you it works, I'll let it demo itself. Everything you're about to see is live — real rounds, real AI adversaries, nothing pre-recorded."

**Beat 1 — The Notario** *(the scenario built for this audience)*
> "This is Héctor. He runs an immigration-services storefront. He never once says the words 'I am a lawyer' — he just says *notario*, and lets twenty years of your life experience finish the sentence. That's the whole con.
>
> Watch — the app asks him the one question that breaks it: *are you a licensed attorney?*"

*(Let the concession land on screen: no bar number, no DOJ accreditation.)*

> "He folds, because our playbooks force honest concessions when you corner them precisely. And then he re-anchors on the deadline — which is exactly what a real one does."

**Beat 2 — the Evidence File**
> "We take the bad deal on purpose, and this is the payoff: the Evidence File. Seven thousand two hundred dollars — fifteen hundred cash, twelve hundred in 'filing fees' for a form that has **no USCIS filing fee at all**, and forty-five hundred to a real attorney to undo it. And the part that isn't money: a frivolous asylum claim filed in your name can bar you from relief for life.
>
> Every tactic he ran is stamped in the margin — caught, resisted, or fell for it — with the exact quote as evidence."

**Beat 3 — breadth** `[CUT FIRST]`
> "Same engine, six scenarios — a payday lender, a fake recruiter, a landlord's poisoned lease, a toll-fee text, and a bank imposter in full voice mode with live captions. That one you answer with your actual voice."

*(If the auto-demo is still running when you hit 3:15, hit **Esc** and move on. Never let the demo run the clock out.)*

### 3:20–4:15 · THE ARCHITECTURE `[CORE]` — this is the Technical Execution score

**[SCREEN]** Deck slide 5 — Three Engines.

> "Three engines, and the separation is the entire technical argument.
>
> **One — the adversary.** Every scammer is a persona plus a JSON playbook: tactics, escalation rules, and required concessions. Data, not code.
>
> **Two — the referee.** A *separate* model call grades the transcript against our ten-tactic taxonomy. **The scammer never grades its own exam.**
>
> **Three — the damage engine.** Every dollar you just saw is deterministic TypeScript. Pure functions, twenty-seven unit tests, zero AI. The payday APR is the real CFPB formula; the fake-check timeline is Regulation CC. We also re-run the key computation through Wolfram Alpha and badge it — two independent systems, one number, or the badge refuses to render.
>
> And if you pull the API key entirely, scripted state machines run the same playbooks offline. The demo cannot break — which is why I was willing to let it drive itself in front of you."

### 4:15–5:00 · BUSINESS + CLOSE `[CORE]`

**[SCREEN]** `/for-institutions` in the app *(not a slide — it's shipped in the product)*.

> "Who pays? This is **KnowBe4 for consumer fraud.** KnowBe4 built a multi-billion-dollar category selling simulated phishing to train employees. We train everyone else.
>
> Banks and credit unions license it as measurable loss prevention — scam reimbursement is a line on their P&L now — white-labeled as the brand scammers actually impersonate. Schools and settlement orgs are the second stream, where the Evidence File becomes gradeable coursework. Consumers are the funnel: free, then a new adversary every month, tracked to FTC alerts.
>
> It scales because new scams are content, not engineering. The Notario you just watched didn't exist yesterday — one JSON playbook and a damage function, and the referee, the tactic system, and the entire UI stayed untouched.
>
> **FoolProof turns fraud from something people learn about after losing money into a reflex they practice before it matters.**
>
> Get scammed here — so it never happens out there. Thank you."

---

## PART 3 — ZOOM RUN OF SHOW

Presenting remotely into an in-person room is a real disadvantage: you have no body language, no room energy, and you are one dropped frame from being forgotten. Compensate with flawless mechanics.

### The night before (tonight)
- [ ] **P0 — the live URL is dead.** `foolproof.onrender.com` returns *"This service has been suspended by its owner."* If a judge clicks it, that is the last impression they have. **Either** un-suspend/redeploy it in the Render dashboard **or** remove the URL from the deck's closing slide. Do not leave it pointing at a suspended service.
- [ ] Run `npm run seed:reset && npm run dev` and play the **full auto-demo once, start to finish.** It must be green.
- [ ] Record a **backup screen capture of the full auto-demo** (3 min, with audio). If anything breaks live, you play the recording and narrate over it. This is your parachute — do not skip it.
- [ ] Decide who speaks. **One presenter.** Remote + multiple speakers = talking over each other on lag. One voice, one screen.
- [ ] Charge everything. Test the mic you'll actually use.

### 30 minutes before
- [ ] `npm run seed:reset` — clean stamps, zero tallies, UNPLAYED across the Gauntlet.
- [ ] `npm run dev` — confirm **both** lines: API on :3001, and the adversary line (live key or scripted fallback).
- [ ] Open exactly three tabs, in this order: **`pitch/deck.html`** (fullscreen-ready) · **`localhost:5173`** (welcome page) · **`localhost:5173/for-institutions`**.
- [ ] Browser at 100% zoom, bookmarks bar hidden, **every other tab closed**, notifications OFF (Focus Assist / Do Not Disturb).
- [ ] Zoom: test **screen share of a specific window** (not full desktop — you don't want a Slack toast on camera). Enable "Optimize for video clip" **off** (it softens text).
- [ ] Have `docs/JUDGE_QA.md` open on a **second device** — never on the shared screen.

### During
- **Share the browser window, not the desktop.** Rehearse the tab-switch once.
- Speak ~10% slower than feels natural. Lag eats consonants.
- When the auto-demo is driving, **keep talking.** Silence over Zoom reads as a frozen screen.
- If something breaks: don't apologize twice. Say *"I'll switch to the recording"* and move. Composure is scored, even when it isn't on the rubric.
- **Watch the clock.** Landing at 4:45 is strong; getting cut off at 5:00 mid-sentence is not.

### Q&A
- Answer in **two sentences, then stop.** Rambling is how good projects lose Q&A.
- If you don't know: *"I don't have that number in front of me — here's what I do know."* This bench respects it.
- **Offer the chair:** *"If any judge wants to try it, I'll drop a link and you can play a round right now."* Nobody else can make that offer.

---

## PART 4 — THE FOUR CRITERIA, EXPLICITLY

Make sure each of these lands somewhere in the five minutes. If a criterion never gets said out loud, it doesn't get scored.

| Criterion | Our line |
|---|---|
| **Impact (25%)** | "$15.9B reported; fraud targets whoever doesn't know the rules yet — which in this country is newcomers, first." |
| **Creativity (25%)** | "Every other team built AI that helps you. We built AI that robs you." |
| **Technical Execution (25%)** | "Three separated engines. The scammer never grades its own exam. Every dollar is deterministic TypeScript with 27 tests and a Wolfram cross-check." |
| **Feasibility (25%)** | "KnowBe4 for consumer fraud — three revenue streams, and the business page is shipped inside the product. New scams are content, not code." |

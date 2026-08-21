# JUDGE Q&A — Open Atlas Demo Day

**Rule for every answer: two sentences, then stop.** Offer to show code or run a round instead of talking longer. Rambling is how good projects lose Q&A.

**Know your audience.** Nikin Tharan is a FINRA Registered Rep. Sanil Almeida does security at Visa; Veeraj Gadda is at PayPal; Narayan Pharkya founded a remittance company. **Four judges live in fraud and payments professionally.** Never round a number, never guess a statistic, and never say "studies show" without naming one.

---

## THE FIVE THAT DECIDE THE OUTCOME

### 1. "Was this built during the hackathon?" ⚠️ *most likely question, most dangerous*

> "Straight answer: the core platform was built in July, for an earlier hackathon. What I built for Open Atlas is The Notario — because when I held our five scenarios up against *this* community, not one of them spoke to it. I authored it to our Scam Factory's schema, validated it with the same validator, and it loaded with **zero engine changes**. That's not me patching a gap — it's the architecture's thesis working in front of you: new scams are content, not code."

**If pressed — "did you actually run the generator?"** Answer plainly: *"Not for this one. The Toll Text was CLI-generated; I hand-wrote the Notario to the same schema because I wanted the legal details exact. Same validator, same damage engine, same zero code changes."* Precision here costs nothing and buys everything.

**Do not dodge this.** Several other finalists have the same exposure and will get caught being cagey. Answering it in one breath, with a concrete in-window artifact to point at, is the strongest possible position.

### 2. "Where is the AI actually doing work? Isn't this just prompts?" *(the organizer's stated bar)*

> "Three places, and only one of them is generative. The adversary is a Claude character constrained by a JSON playbook with required concessions. The referee is a *separate* model call that grades the transcript against a ten-tactic taxonomy — the scammer never grades its own exam. And the third engine has no AI at all: every dollar is deterministic TypeScript."

Then: *"Pull the API key and the whole loop still runs on scripted state machines. A prompt wrapper can't do that."*

### 3. "How do you know your numbers are correct?" *(the FINRA/Visa question)*

> "Because we don't generate them. The payday APR is the CFPB fee structure — fifteen dollars per hundred over a fourteen-day term annualizes to three-ninety-one percent. The fake-check timeline is Regulation CC: provisional credit in days, but a counterfeit can take weeks to bounce, and the scam lives entirely in that gap. Thirty-four unit tests lock those functions, and each scenario's key computation is independently re-run by Wolfram Alpha at debrief time."

If pressed on the Notario figures: *"$1,500 and $1,200 are typical notario fee ranges; the $4,500 is what remediation counsel costs. The load-bearing fact is the one that isn't an estimate: **Form I-589 has no USCIS filing fee**, so 'filing fees' is a pure invention — that's checkable on uscis.gov."*

### 4. "Does simulated training actually change behavior?" *(the strongest attack on the premise)*

> "This sits in inoculation theory — the idea that a weakened exposure builds resistance. It's the same principle behind Cambridge's *Bad News* game for misinformation and Google Jigsaw's prebunking work, and commercially it's the entire KnowBe4 thesis: companies pay billions because simulated phishing measurably lowers click rates. We haven't run our own efficacy study — that's the honest answer, and it's the first thing I'd spend a pilot on: pre/post catch-rate on a held-out scenario."

**Never overclaim here.** Naming the research tradition *and* naming what you haven't done is what makes the rest of your claims credible to this bench.

### 5. "Who actually pays for this?"

> "Banks and credit unions, as loss prevention. Scam reimbursement is a P&L line now, so training members against the exact imposter pattern that drives those reimbursements is measurable spend — white-labeled as the brand scammers actually impersonate, because that's who they impersonate. Schools and settlement orgs are the second stream; consumers are the free funnel."

Then the differentiator: *"That page isn't a slide — it's shipped in the product at /for-institutions."*

---

## TECHNICAL PROBES

**"What stops the adversary from being jailbroken or saying something harmful?"**
> "Playbook guardrails go into the system prompt — never request real personal data, never break character, react in-character to injection attempts — and replies are capped. The user has explicitly consented to face a training adversary, and the referee reads the full transcript afterward, so drift shows up in the Evidence File. And the damage engine means the AI can never invent a scarier number than the truth."

**"What happens when the model gets something wrong?"**
> "Nothing financial, by construction — the model can't touch a number. The worst failure mode is a flat or off-tone line from the character, which costs realism, not accuracy. That's a deliberate trade: we put the AI where mistakes are cheap and kept it out of where they aren't."

**"What was the hardest engineering problem?"**
> "Streaming a hidden control channel. The adversary emits a beat marker so the server can track playbook progress, but we stream tokens live — so the SSE writer holds back a fourteen-character tail until it's provably not the marker, then strips it before persisting. Second hardest was making the offline fallback *identical* in wire shape to the live path, so the UI can't tell which engine it's talking to."

**"How does the referee avoid just agreeing with the player?"**
> "It never sees the player's reasoning — only the transcript, the taxonomy, the playbook's ground truth, and the flags they raised. It returns strict JSON per beat: caught, resisted, or fell for it. And a correct live flag can only *upgrade* a finding, so guessing wildly gets you stamped UNFOUNDED rather than credited."

**"Scale? This is SQLite."**
> "Stateless HTTP API, so it scales horizontally today. SQLite to Postgres is a Drizzle dialect change, not a redesign — sessions already live in the database, so instances restart without logging anyone out. The content pipeline is the part that actually needs to scale, and that's JSON."

**"Privacy — what do you store?"**
> "Rounds and transcripts against a guest or username account. No documents are uploaded, no PII is requested — the scenarios are fictional by design, so there's nothing sensitive to leak. That's a deliberate contrast with document-upload tools in this space."

---

## IMPACT / SOCIAL-GOOD PROBES

**"Why is this a *newcomer* tool and not a general one?"**
> "Because fraud targets whoever doesn't know the rules yet, and newcomers are structurally that person — new to the documents, the institutions, and the norms. The Notario exists because in most of Latin America a *notario público* is a licensed attorney, and scammers here monetize that single mistranslation. Jargon is the weapon, which is why the lease scenario ships a plain-English translator."

**"Isn't this teaching people how to scam?"**
> "Every tactic in it is already documented publicly by the FTC and USCIS — we didn't invent any of it. What's scarce isn't the knowledge, it's the rehearsal. Same logic as fire drills and phishing simulations."

**"Could this be culturally insensitive — a Latino character as a scammer?"**
> "Notario fraud is a crime committed *against* immigrant communities, and it's named and prosecuted as such by USCIS, the FTC, and state AGs. The scenario casts the perpetrator as the villain and teaches the exact defenses USCIS recommends: demand the bar number or accreditation letter, read and keep your own form, pay the government directly. Next step is native-language versions, since these scams are run in the target's first language."

**"How many users do you have?"**
> "None in production — we're pre-pilot, and I'd rather say that than inflate it. What we have is a working product, deterministic outcomes we can measure, and the ask is a pilot with one credit union or settlement org where the metric is pre/post catch-rate."

**Honesty here is a weapon.** At least one competitor is claiming traction their app store listing contradicts.

---

## THE CLOSERS

**"What's next?"**
> "Native-language scenarios, difficulty tiers that get subtler as your catch-rate rises, and playbook tooling so a credit union's fraud team can author scenarios without touching code. And an efficacy study — that's the number I most want to have."

**"Why should this win?"**
> "Because it's the only project here that makes you *feel* the loss instead of explaining it — and it's built so the feeling is backed by math the AI can't touch. Everyone else built something that helps you after you've already been targeted. We built the rehearsal that happens before."

**If offered extra time or a follow-up:**
> "I'd rather show than tell — give me thirty seconds and a judge can play a round themselves right now."

---

## THINGS TO NEVER SAY

- ❌ "Studies show simulation training works" *(name Cambridge/Jigsaw/KnowBe4 or say nothing)*
- ❌ "About $16 billion" *(it's $15.9B, reported, FTC, 2025 — precision is the credibility)*
- ❌ "We have users" *(we don't; say pre-pilot)*
- ❌ "It's fully built" *(say what's shipped and what's next)*
- ❌ Anything vague about the hackathon timeline *(answer #1, immediately, every time)*


---

## THE SECOND WAVE — likely, and not yet drilled

### Cost & unit economics *(the engineers will ask this)*
**"What does a round cost you?"**
> "A round is roughly five short adversary turns plus one referee call — small prompts, capped outputs. Call it cents, not dollars, and the referee is the expensive half, which is why it runs without extended thinking. At institutional scale the cost per trained member is trivial next to a single reimbursed scam."

⚠️ **Know your real number before you go on.** Check your Anthropic console for spend-per-round and say the actual figure. A confident "about three cents" beats a vague "it's cheap."

### Language *(near-certain in THIS room — do not get caught)*
**"Notario fraud is run in Spanish. What languages do you support?"**
> "English only today, and that's the honest gap — it's the single biggest thing between this and the people who need it most. The architecture doesn't fight it: playbooks are JSON and the adversary is a language model, so a Spanish Héctor is a translation and a persona pass, not a rewrite. It's the first thing a pilot would fund."

Never bluff this. The room will know.

### Unauthorized practice of law
**"You're simulating immigration advice. Isn't that UPL, or close to it?"**
> "We deliberately never advise. FoolProof teaches three questions — demand the bar number or accreditation letter, read and keep your own form, pay the government directly — which are USCIS's own published guidance, not our legal opinion. The product's whole message is *go find a real accredited representative.*"

**"If someone relies on this and gets it wrong, who's liable?"**
> "Same posture: we're training, not counsel, and every scenario is fictional. For an institutional deployment that becomes an explicit disclaimer plus a referral path to the partner's own legal aid."

### The moat question
**"What stops KnowBe4 — or the bank itself — from just building this?"**
> "Nothing stops them, and that's the honest answer. What's hard isn't the chat: it's the library of researched playbooks with concessions that survive an expert, and the deterministic engine behind every dollar. That's content and domain work, which compounds — a bank building it in-house builds one scenario and stops."

### Model & infrastructure choices
**"Why Claude? Why not a small open model?"** → Character consistency under pressure is the product; a weak model breaks character the moment it's cornered, which is exactly the demo. The referee's structured-JSON reliability matters more than raw cost.
**"Latency?"** → First token in a couple of seconds, grading in under ten. The referee is capped at twenty seconds and falls back to the deterministic grader.
**"What if a user prompt-injects the adversary?"** → Guardrails are in the system prompt, replies are capped, and the referee reads the whole transcript afterward — drift shows up in the Evidence File. Nothing financial is exposed, because the model can't touch a number.
**"Concurrency?"** → Stateless HTTP, one round per session, sessions in the DB. Horizontal scaling is boring here, which is the point.

### Honesty tests *(they're checking character, not facts)*
**"What's broken right now?"**
> "Three things: English only, no efficacy study, and no real users — we're pre-pilot. The deployment is also free-tier, which is why I'm demoing locally."

**"What did you cut?"** → Difficulty tiers, native-language scenarios, and the playbook editor for partner fraud teams.
**"Who built what?"** → Answer plainly and name your teammates' actual contributions.
**"How long did it take?"** → See question #1 — same honest framing.

### Business specifics
**"What's the actual price?"** → Per-member-per-year for FIs, per-seat for schools, $4/mo consumer. Say a number if pressed; vagueness reads as no model.
**"Who's your first customer?"** → A credit union or a settlement org — small enough to move, close enough to the loss. The ask is one pilot with pre/post catch-rate as the metric.
**"Credit-union sales cycles are 6–18 months. How do you survive that?"** → Consumer freemium and school seats fund the wait; the FI deal is the compounding one.

### Curveballs
**"What would you do with the prize?"** → Native-language scenarios and the efficacy study.
**"Why you over the other finalists?"** → Contrast, never attack: most tools help after you've been targeted; this is the rehearsal before.
**"Can you show me X right now?"** → Say yes and navigate. You know this app; let them steer for thirty seconds.

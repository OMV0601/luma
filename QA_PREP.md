# FoolProof — Live Q&A Prep

The rubric weights **Communication 25%**, judged partly on the live Q&A: "a deep understanding of the product, its technical architecture, and its target consumers." Below are the questions you'll actually get, with answers you can say in one breath. Read them out loud until they're yours — don't memorize verbatim, memorize the *point*.

**Your Q&A weapon:** a laptop or phone open to `/play?scenario=payday`. Offer it: "Want to try to out-negotiate the loan shark?" Let a judge get hustled by Danny for 60 seconds. Nobody else will do this.

---

## The "isn't this just a ChatGPT wrapper?" question (you WILL get this)

> "It's the opposite of a wrapper, and the architecture is the proof. Three parts do the work, and only one of them is a model call. The adversary is a model, yes — but it's driven by a structured playbook we authored, not free-form chat. The **referee is a second, independent model** that grades the transcript — the scammer never grades its own exam, which is the integrity guarantee a single wrapper can't give you. And the **damage engine has no AI at all** — it's pure functions with 27 unit tests; the numbers are computed, not generated. A wrapper is one prompt. This is an adversarial system with an independent grader and a deterministic scoring layer."

## "Where do the dollar figures come from? How do I know they're right?"

> "Every number is a deterministic function in `server/src/damage/` — the CFPB payday-APR formula, the Regulation CC check-clearing timeline, lease-clause arithmetic — and they're locked by 27 passing unit tests you saw in the video. The model literally cannot touch them. We go one further: each scenario's headline figure is independently recomputed by Wolfram|Alpha and compared, so it's two systems agreeing on every dollar."

## "How does the referee actually grade?"

> "At the decision point, a separate model call gets the full transcript, the 10-tactic taxonomy, the playbook's ground-truth beats, and the tactics the user flagged live. It returns strict JSON: for each tactic the adversary attempted, an outcome — caught, resisted, or fell for it — plus the evidence quote. We parse it defensively with a retry, and if it ever fails, a deterministic offline grader takes over. A correct live flag on the right message upgrades that tactic to 'caught' automatically."

## "What's the Scam Factory — is that real or a gimmick?"

> "Fully real, and it's the moat. `npm run scam-factory` takes a real scam alert, makes one model call to draft a complete scenario — persona, five-tactic playbook, offline fallback, and a *damage spec* — then our code validates it hard (the tactics must be real taxonomy ids, the fallback tree must be complete, the dollar amounts must be finite integers) and inserts it. From then on it's deterministic like the hand-built ones. Our fifth adversary, the toll-text scam, was generated this way from an FTC alert. It means a scam that trends today is a playable lesson tomorrow — content ops, not an engineering sprint."

## "What happens if the AI is down, or you have no API key?"

> "The whole app still runs. Every scenario ships a scripted fallback — a deterministic state machine that walks the same playbook with keyword-triggered branches, and a rule-based grader scores the round. We built it so a demo can't die on stage. It's also our cost floor: not every round needs to hit the API."

## "How does this scale — data and users?"

> "Three ways. **Content:** playbooks are JSON and the Scam Factory generates them, so the scenario library scales without engineering. **Infrastructure:** the referee and damage engines are shared across every scenario — a new one inherits them for free. **Systems:** the API is stateless HTTP, so it scales horizontally, and SQLite-to-Postgres is a one-line Drizzle dialect change because we're already on an ORM. Nothing about adding the 50th scenario or the 50,000th user changes the architecture."

## "Who's the customer, really? Consumers don't pay for this."

> "Right — which is why the primary buyer is **B2B: banks and credit unions.** Scam reimbursement is a real cost line for them now, not a PR issue, so training members on the exact call pattern that drives those reimbursements is measurable loss-prevention — and we white-label it to the institution scammers actually impersonate. That's the KnowBe4 playbook: they sell simulated phishing to employers, we sell simulated fraud to institutions that eat the losses. Schools are the second market — personal finance is a graduation mandate in most states and our Evidence File is gradeable. Consumer freemium is top-of-funnel, not the revenue engine."

## "Isn't it dangerous to build an AI that scams people / teaches manipulation?"

> "It's inoculation, not instruction — the same model as a flu shot or a phishing-simulation drill. The adversary is bounded by guardrails: it never asks for real personal data, it stays in a clearly-labeled training frame, and it exists only so the user learns to recognize the tactic when a real one arrives. The tactics themselves are already public in FTC and CFPB reports; what's missing for most people is the *practice* catching them under pressure. That's what we provide, safely."

## "How is this inclusive / accessible?" (the rubric names this focus area)

> "Three concrete things, not a checkbox. The lease has a **Plain English mode** — every clause translated to one honest sentence, so the trap exposes itself; jargon is where the money hides, so translating it *is* the lesson. There's an **Atkinson Hyperlegible font toggle**, a typeface designed for low-vision and dyslexic readers, across all running text. And the **voice scenario has always-on captions** with a typed fallback, so it works without a mic or without audio. Scams target non-native speakers and older adults hardest — the accessibility is aimed straight at the most-exposed users."

## "What would you build next?"

> "Spanish-language adversaries — scams localize, and non-native speakers are disproportionately targeted, so the con should run in the user's language. An institution dashboard showing cohort awareness scores and the most-missed tactics. And a scenario marketplace where consumer-protection orgs author scenarios in our JSON format — the Scam Factory already proves the pipeline works."

---

## Demo-day operational checklist

- [ ] **Warm the URL** 2–3 minutes before you present (free tier sleeps after ~15 min idle; first hit is a 30–60s cold start).
- [ ] `npm run seed:reset` for a clean judge state (fresh stamps, zero tallies).
- [ ] Have `/play?scenario=payday` **already loaded** on the handoff device.
- [ ] Phone or narrow window ready for the voice beat; mic permission pre-granted in **Chrome**.
- [ ] Know your numbers cold: **$15.9B** FTC 2025 losses · **391%** payday APR · **27** unit tests · **$4,800** protected on the fraud call · **5** adversaries (one factory-made).
- [ ] If asked something you don't know: "Great question — the honest answer is we haven't tested that yet, here's how we'd approach it…" Judges reward calibrated honesty over bluffing.

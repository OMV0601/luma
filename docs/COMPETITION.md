# THE FIELD — 12 rival finalists, scouted

Researched from Devpost pages, live demos, and public repos. Read once tonight; skim the top table before you go on.

## The field at a glance

| Project | What it is | Track | Real threat? |
|---|---|---|---|
| **WageShield H-1B** | H-1B wage-theft evidence auditor, privacy-first | Immigration | 🔴 **Highest** |
| **Spairly** | Marketplace pairing spare AI capacity with nonprofits | Open | 🔴 High (tech) |
| **Proofly** | Immigration copilot: doc → deadlines, O-1 evidence plan | Immigration | 🔴 High |
| **ShowWhere** | Desktop overlay that highlights where to click | Open | 🟠 High tech, weak impact |
| **TRACE** | Trafficking-caseworker notes → IOM-standard case records | Immigration | 🟠 Strong narrative |
| **Réunia Career Bridge** | Foreign résumé → US-ready + mock interviews | Career | 🟠 Most polished |
| **DocuPal** | Upload immigration paperwork → plain language, 12 langs | Immigration | 🟠 Best track fit |
| **Lumos** | Immigration deadlines for neurodivergent brains | Immigration | 🟡 Great positioning |
| **OweMe Health** | Reconciles medical payments vs. insurance EOBs | Fin. Inclusion | 🟡 Our category rival |
| **Kaktua** | AI English speaking coach (shipped on Play Store) | Education | 🟡 Only one monetizing |
| **VERA Ai** | Reads benefits eligibility charts → autofills forms | Fin. Inclusion | 🟢 Thin build |
| **ScholarPilot** | AI scholarship matching | Education | 🟢 6 commits, no video |

## The three gaps we exploit

**1. Nobody has a business model.** Not one of the twelve states pricing, revenue, or GTM. Kaktua is the only monetizing product, and its claim of "hundreds of active users, 15% conversion" is contradicted by a Play Store listing showing **10+ downloads**. Feasibility is 25% of the score and the field is largely forfeiting it. Our `/for-institutions` page is shipped *in the product*.

**2. Demo fragility.** Several have **no demo video at all** (Proofly has a Loom; ShowWhere and OweMe have videos; TRACE, Réunia, VERA, Lumos, DocuPal, ScholarPilot do not). Multiple depend on Render free-tier apps cold-starting live. Our hands-free auto-demo plus full offline mode is the most demo-proof entry in the field.

**3. Determinism.** Most of the field is OCR → LLM → summary. DocuPal, VERA, and Proofly have thin answers to *"what happens when the model gets a date or a dollar wrong?"* — on immigration paperwork, that's catastrophic. Our answer is structural: **the AI never touches a number.**

## The three we should actually worry about

**WageShield H-1B** — 5-person team, 37 likes/10 comments (most engaged in the field), two-pass verification with citation grounding, real tests, architecture + evaluation docs, live on Render, cleanest Immigration fit. *Its soft spot:* "100% citation grounding" is measured against **their own synthetic benchmark** — no real payslips, no real-world accuracy. Also ships documents to a third-party inference API while claiming "zero data leakage."

**Spairly** — the deepest engineering in the field: full AWS prod environment in Terraform, GuardDuty scanning, DynamoDB transactional writes. *Its soft spot:* the flagship demo scenario is **fictional**, the GitHub link **404s**, it admits zero adoption, and marketplace cold-start is unaddressed.

**Proofly** — 201 backend + 29 frontend tests (I verified the repo), live demo, Loom video, explicit safety posture. *Its soft spot:* it deliberately **won't tell you if you qualify** — "evaluates document readiness, not visa eligibility" — so a judge can fairly ask what it's worth beyond a smart folder. Solo builder, 18 commits.

## Where we win on each criterion

- **Impact** — tied field-wide, but we're the only one addressing fraud *loss*, and the Notario aims straight at this community. Most rivals help you with paperwork; we stop you losing money.
- **Creativity** — **we win this outright.** Eleven assistants and one adversary. Nobody else inverted the premise.
- **Technical Execution** — competitive with the top three. Our distinguishing claim is *separation of concerns* (adversary / referee / deterministic math), which is architecturally more interesting than "we have tests."
- **Feasibility** — **we win this outright**, because almost nobody else even tried.

## Positioning notes

- **Immigration track is a bloodbath** — Proofly, Lumos, DocuPal, WageShield, TRACE all fight there for the O-1 prize. **Don't frame ourselves as an immigration-paperwork tool.** We're financial protection *for* newcomers, which is a different, emptier lane.
- **Financial Inclusion is nearly open.** Only VERA Ai (no live demo at all) and OweMe Health (arguably not an AI project — its Built With lists no model) are in it. We should be the obvious pick.
- **Don't attack anyone by name.** Judges dislike it and the room is collaborative. Win on contrast — *"most tools help you after you've been targeted"* — never on takedowns.

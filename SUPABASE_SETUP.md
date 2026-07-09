# Supabase — what I need from you, and my honest recommendation

Login/signup with a username and password is **built and working right now** — no Supabase required. It uses Node's built-in scrypt for password hashing (no external service, nothing to break on stage) and stores accounts in the app's database. You can sign up, log in, log out, and switch accounts today.

So the real question isn't "how do we add auth" — that's done. It's **"what should Supabase actually do for us,"** and there are two very different answers. Read this before you set anything up, because they need different things from you and carry very different risk this close to the deadline.

---

## Option A — Supabase Postgres as the database (what I recommend, *if* you do it)

Right now the whole app runs on a local SQLite file. On Render's free tier that file **resets on every deploy or sleep** — so accounts and history don't survive. Pointing the app at Supabase's hosted Postgres fixes that: real persistence, accounts that stick, a dashboard where you can see your users. This is the version of "using Supabase" that actually buys you something.

**What I'd need from you:** just one thing — the **connection string**.
1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. Set a database password when prompted — **write it down.**
3. Go to **Project Settings → Database → Connection string → URI**.
4. Copy the **"Session pooler"** or **"Transaction pooler"** string (looks like `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-...pooler.supabase.com:6543/postgres`).
5. Put your real password where it says `[YOUR-PASSWORD]`, and send me the full string. I'll store it as `DATABASE_URL` in the server env (never in git) and on Render.

**Honest cost:** this is a real migration — I'd swap the database driver, move the schema and the session store from SQLite to Postgres, and re-test everything end to end. It's maybe an hour of careful work plus verification. It's not risky if we do it with time to spare, but I would **not** do it the night before you record, because a database swap is exactly the kind of change that can introduce a subtle bug. If you want this, give me the connection string with at least a day of buffer.

---

## Option B — Supabase Auth (the "login" product)

Supabase also sells a hosted auth service (their pre-built login/signup + JWTs). We *could* route auth through it instead of our own.

**My honest take: skip this one.** We'd be tearing out working, tested, offline-proof auth and replacing it with a dependency that can fail during your demo, to end up with the same login box. Supabase Auth also really wants an email address per user — which fights your "no email, just a codename" design. It solves a problem you no longer have.

If you specifically want it anyway, I'd need: your project **URL**, the **anon public key**, and the **service-role key** (from Project Settings → API). Tell me and I'll scope the work — but I'll push back once first.

---

## My actual recommendation

**For the hackathon: ship what's built (scrypt auth on SQLite) and don't migrate anything before you record.** It works, it can't break on stage, and guest mode keeps the demo instant. A judge will never know or care whether the password hash lives in SQLite or Postgres.

**If you want the persistence win** (accounts that survive across deploys, a real user table you can point to in Q&A), do **Option A** — send me the connection string with a day of buffer and I'll migrate it carefully and re-verify the whole golden path.

Either way, **your demo does not depend on this.** That's the important part. Tell me which way you want to go, or say "leave it on SQLite" and we're already done.

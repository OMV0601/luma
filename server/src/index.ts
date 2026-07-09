/**
 * FoolProof server entry: Express + sessions + API routes.
 * Dev: Vite proxies /api here. Prod: this serves client/dist too.
 */
import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { seed } from "./seed.ts";
import { api } from "./routes.ts";
import { hasApiKey } from "./adversary/llm.ts";
import { SqliteSessionStore } from "./sessionStore.ts";

seed();

const app = express();
// Render (and most PaaS) terminate TLS at their proxy; trust it so
// secure:"auto" cookies work over HTTPS in prod and plain HTTP locally.
app.set("trust proxy", 1);
app.use(express.json());
app.use(
  session({
    store: new SqliteSessionStore(), // survives server restarts
    secret: process.env.SESSION_SECRET || "foolproof-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", secure: "auto", maxAge: 1000 * 60 * 60 * 24 * 30 },
  })
);

app.use("/api", api);

// Prod: serve the built client if it exists.
const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

// JSON error handler — never leak a stack trace to the client.
app.use(
  (err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[server]", err);
    res.status(err.status ?? 500).json({ error: err.message || "Internal error" });
  }
);

const PORT = Number(process.env.PORT) || 3001;

/**
 * Listen with retry. Under `tsx watch`, a restart can race the old process
 * for the port (EADDRINUSE) — especially with OneDrive touching files and
 * triggering extra restarts. Instead of dying silently in one terminal pane,
 * wait and retry so the dev server heals itself.
 */
function listen(attempt = 1) {
  const server = app.listen(PORT, () => {
    console.log(`FoolProof API on http://localhost:${PORT}`);
    console.log(
      hasApiKey()
        ? "[adversary] live — Anthropic API key found"
        : "[adversary] scripted fallback — no ANTHROPIC_API_KEY (full loop still works)"
    );
  });
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && attempt <= 10) {
      console.warn(`[server] port ${PORT} busy — retrying (${attempt}/10)…`);
      setTimeout(() => listen(attempt + 1), 1000);
    } else {
      console.error("[server] failed to start:", err);
      process.exit(1);
    }
  });
}
listen();

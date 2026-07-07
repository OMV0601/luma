#!/usr/bin/env node
/**
 * Frees the given TCP ports before dev starts. A stale `tsx watch` from a
 * previous session squatting :3001 turns `npm run dev` into a wall of
 * EADDRINUSE — fatal in a live demo. Runs as `predev`, so anything still
 * listening on these ports is by definition stale.
 */
import { execSync } from "node:child_process";

const ports = process.argv.slice(2).map(Number).filter(Boolean);

for (const port of ports) {
  try {
    if (process.platform === "win32") {
      // Vite binds IPv6 ([::1]:5173), Express binds dual-stack — scan both
      // tables or the kill silently misses half the listeners.
      const out =
        execSync(`netstat -ano -p tcp`, { stdio: ["ignore", "pipe", "ignore"] }).toString() +
        execSync(`netstat -ano -p tcpv6`, { stdio: ["ignore", "pipe", "ignore"] }).toString();
      const pids = new Set(
        out
          .split("\n")
          .map((l) => l.trim().split(/\s+/))
          .filter((c) => c[0] === "TCP" && c[1]?.endsWith(`:${port}`) && c[3] === "LISTENING")
          .map((c) => c[4])
      );
      for (const pid of pids) {
        if (pid && pid !== "0") execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      }
      if (pids.size) console.log(`[free-port] :${port} freed (pid ${[...pids].join(", ")})`);
    } else {
      execSync(`lsof -ti tcp:${port} | xargs -r kill -9`, { stdio: "ignore" });
    }
  } catch {
    /* nothing listening — the good case */
  }
}

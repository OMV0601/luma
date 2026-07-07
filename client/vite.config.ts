import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev: Vite on :5173 proxies /api to Express on :3001 (SSE included).
// Prod: `vite build` → Express serves client/dist statically.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: false },
    },
    fs: { allow: [".."] }, // allow importing ../shared/tactics.ts
  },
});

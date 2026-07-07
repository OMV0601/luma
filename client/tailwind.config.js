/** Tailwind theme = the §5 case-file design tokens. */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F1EAD8",
        "paper-bright": "#FAF6EA",
        ink: "#1C1917",
        redink: "#C1361B",
        amber: "#B97E10",
        verified: "#2E7D4F",
        redact: "#111111",
      },
      fontFamily: {
        display: ['"Archivo Black"', "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      borderWidth: { 2: "2px", 3: "3px" },
      boxShadow: {
        card: "3px 3px 0 0 #1C1917",
        stamp: "0 0 0 3px currentColor inset",
      },
    },
  },
  plugins: [],
};

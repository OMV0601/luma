import { motion, useReducedMotion } from "framer-motion";

/**
 * The signature visual: buried content renders behind a black redaction bar
 * that peels away (scaleX collapse) when scrolled into view — the app
 * literally un-redacts the fine print. Reduced motion: content just shows.
 */
export default function Redaction({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <span>{children}</span>;
  return (
    <span className="relative inline-block align-baseline">
      {children}
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-redact"
        initial={{ scaleX: 1 }}
        whileInView={{ scaleX: 0 }}
        viewport={{ once: true, amount: 0.9 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.7, 0, 0.2, 1] }}
        style={{ transformOrigin: "right" }}
      />
    </span>
  );
}

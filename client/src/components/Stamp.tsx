import { motion, useReducedMotion } from "framer-motion";

/**
 * Rubber-stamp verdict: CASE CLOSED (green) / MARK (red) / UNPLAYED (ink),
 * diagonal, spring-in. The signature verdict element.
 */
export default function Stamp({
  verdict,
  size = "md",
}: {
  verdict: "case_closed" | "mark" | "unplayed";
  size?: "sm" | "md" | "lg";
}) {
  const reduce = useReducedMotion();
  const text =
    verdict === "case_closed" ? "CASE CLOSED" : verdict === "mark" ? "MARK" : "UNPLAYED";
  const color =
    verdict === "case_closed"
      ? "text-verified border-verified"
      : verdict === "mark"
        ? "text-redink border-redink"
        : "text-ink/40 border-ink/40";
  const sizes = {
    sm: "text-[10px] px-2 py-0.5 border-2",
    md: "text-sm px-3 py-1 border-[3px]",
    lg: "text-2xl px-5 py-2 border-4",
  };

  return (
    <motion.span
      initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -14 }}
      animate={{ scale: 1, opacity: 1, rotate: -8 }}
      transition={{ type: "spring", stiffness: 320, damping: 16 }}
      className={`inline-block stamp-text font-bold rounded-sm select-none ${color} ${sizes[size]}`}
      style={{ maskImage: "radial-gradient(circle, black 92%, transparent 100%)" }}
      aria-label={`Verdict: ${text}`}
    >
      {text}
    </motion.span>
  );
}

import { Link } from "react-router-dom";

/**
 * Friendly dead-end for expired sessions and files that belong to another
 * agent. A bare "Not logged in" string on camera reads as a crash; this
 * reads as part of the fiction and hands the user a way back in.
 */
export default function SealedFile({ message }: { message: string }) {
  const expired = /not logged in/i.test(message);
  return (
    <div className="mx-auto max-w-md w-full px-4 py-16">
      <div className="paper-card p-6">
        <p className="stamp-text text-[10px] font-bold text-redink">FILE SEALED</p>
        <h1 className="font-display text-2xl mt-2">
          {expired ? "YOUR BADGE EXPIRED." : "THIS FILE ISN'T ON YOUR DESK."}
        </h1>
        <p className="text-sm mt-2 text-ink/70">
          {expired
            ? "Sessions lapse between visits — it happens. Open a new case and the Gauntlet is yours again."
            : "Evidence files are per-agent. Play a round and this page fills itself in."}
        </p>
        <div className="mt-5">
          <Link to="/gauntlet" className="btn-ink px-4 py-2 text-xs">
            Open a new case
          </Link>
        </div>
      </div>
    </div>
  );
}

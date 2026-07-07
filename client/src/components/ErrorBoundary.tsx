import { Component, type ReactNode } from "react";

/**
 * Case-file styled crash screens. A stray render error must never
 * white-screen a live demo — it becomes a "damaged file" card with a way
 * back to the Gauntlet. Rounds live on the server, so nothing is lost.
 */

export function DamagedFileCard({ detail }: { detail?: string }) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-paper">
      <div className="paper-card p-6 max-w-md w-full">
        <p className="stamp-text text-[10px] font-bold text-redink">FILE DAMAGED IN TRANSIT</p>
        <h1 className="font-display text-2xl mt-2">SOMETHING TORE.</h1>
        <p className="text-sm mt-2 text-ink/70">
          The page hit an error. Your rounds are safe on the server — reopen the file and carry on.
        </p>
        {detail && (
          <p className="font-mono text-xs mt-3 text-ink/50 break-words border-l-2 border-ink/20 pl-2">
            {detail}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <a href="/gauntlet" className="btn-ink px-4 py-2 text-xs">
            Back to the Gauntlet
          </a>
          <button className="btn px-4 py-2 text-xs" onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </div>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) return <DamagedFileCard detail={this.state.error.message} />;
    return this.props.children;
  }
}

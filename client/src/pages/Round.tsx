import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Flag, FileText, X } from "lucide-react";
import { api, streamMessage } from "../api";
import type { ChatMessage, RoundStart } from "../types";
import { tacticName } from "../../../shared/tactics";
import FlagPicker from "../components/FlagPicker";
import LeaseDoc from "../components/LeaseDoc";
import { IncomingCall, InCall } from "../components/CallScreen";
import { voiceSupported } from "../voice";
import { SkeletonBlock } from "../components/Skeleton";

type VoicePhase = "incoming" | "active" | "off";

export default function Round() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const nav = useNavigate();

  const [round, setRound] = useState<RoundStart | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState<string | null>(null); // streaming adversary text
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [decisionReady, setDecisionReady] = useState(false);
  const [beat, setBeat] = useState(0); // 0-based index of the playbook beat in play
  const [error, setError] = useState<string | null>(null);
  const [picker, setPicker] = useState<number | null>(null); // messageId being flagged
  const [showDoc, setShowDoc] = useState(false);
  const [clauseFlags, setClauseFlags] = useState<string[]>([]);
  const [voice, setVoice] = useState<VoicePhase>("off");
  const [introSeen, setIntroSeen] = useState(false);

  const created = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Create the round on mount (guarded against StrictMode double-fire). */
  useEffect(() => {
    if (created.current || !scenarioId) return;
    created.current = true;
    (async () => {
      try {
        // /play deep-links land here without a user; auto-guest.
        const me = await api.me<{ user: unknown }>();
        if (!me.user) await api.guest();
        // Voice is gated on the scenario's own supportsVoice flag (returned
        // with the round) — any voice-capable scenario gets the call screen.
        const wantsVoice = voiceSupported();
        const r = await api.startRound(scenarioId, wantsVoice);
        setRound(r);
        setMessages(r.messages);
        if (r.scenario.supportsVoice && wantsVoice) setVoice("incoming");
        else setIntroSeen(false);
      } catch (err) {
        setError((err as Error).message);
      }
    })();
  }, [scenarioId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, draft]);

  async function send(text: string) {
    if (!round || busy || !text.trim()) return;
    setBusy(true);
    setError(null);
    setInput("");
    const userMsg: ChatMessage = {
      id: -Date.now(),
      role: "user",
      content: text.trim(),
      turnIndex: messages.length,
    };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    try {
      const done = await streamMessage(round.sessionId, text.trim(), (delta) =>
        setDraft((d) => (d ?? "") + delta)
      );
      setMessages((m) => [...m, done.message]);
      setBeat(done.beat);
      setDecisionReady((r) => r || done.decisionReady);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDraft(null);
      setBusy(false);
    }
  }

  async function flag(messageId: number, tacticId: string) {
    if (!round) return;
    setPicker(null);
    setMessages((m) =>
      m.map((msg) =>
        msg.id === messageId
          ? { ...msg, flagged: [...(msg.flagged ?? []), tacticId] }
          : msg
      )
    );
    try {
      await api.flag(round.sessionId, messageId, tacticId);
    } catch {
      /* non-fatal: the referee just won't see it */
    }
  }

  async function flagClause(clauseId: string, tacticId: string) {
    if (!round || clauseFlags.includes(clauseId)) return;
    setClauseFlags((c) => [...c, clauseId]);
    const anchor = messages.find((m) => m.role === "adversary");
    if (anchor) {
      try {
        await api.flag(round.sessionId, anchor.id, tacticId);
      } catch {
        /* non-fatal */
      }
    }
  }

  async function decide(decision: string) {
    if (!round || deciding) return;
    setDeciding(true);
    setError(null);
    try {
      await api.decide(round.sessionId, decision);
      nav(`/debrief/${round.sessionId}`);
    } catch (err) {
      setError((err as Error).message);
      setDeciding(false);
    }
  }

  /* ---------------- loading ---------------- */
  if (!round) {
    return (
      <div className="mx-auto max-w-2xl w-full px-4 py-10 space-y-4">
        {error ? (
          <div className="paper-card p-5 text-redink font-mono text-sm">{error}</div>
        ) : (
          <>
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-14 w-3/4" />
            <SkeletonBlock className="h-14 w-2/3 ml-auto" />
          </>
        )}
      </div>
    );
  }

  const s = round.scenario;
  const lastAdversary = [...messages].reverse().find((m) => m.role === "adversary");

  /* ---------------- voice phases (fraud call) ---------------- */
  if (voice === "incoming") {
    return (
      <IncomingCall
        caller={s.callerId}
        onAnswer={() => setVoice("active")}
        onDecline={() => decide("walk")}
      />
    );
  }
  if (voice === "active") {
    return (
      <InCall
        callerName={s.adversaryName}
        caller={s.callerId}
        lastAdversaryLine={draft === null ? (lastAdversary?.content ?? "") : ""}
        busy={busy || deciding}
        onUserSpeech={(text) => send(text)}
        onHangUp={() => decide("walk")}
        onTransfer={() => decide("take")}
        onSwitchToText={() => setVoice("off")}
      />
    );
  }

  /* ---------------- text chat ---------------- */
  return (
    <div className="mx-auto max-w-2xl w-full px-3 sm:px-4 flex flex-col flex-1 min-h-0">
      {/* header */}
      <div className="flex items-center justify-between gap-2 py-3 border-b-2 border-ink">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl" aria-hidden>
            {s.avatar}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-sm truncate">{s.title.toUpperCase()}</h1>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50 truncate">
              subject: {s.adversaryName}
              {s.beatCount > 0 && (
                <span
                  className="ml-2 text-ink/40"
                  title="Case progress — the con has this many acts"
                  aria-label={`Case progress: act ${Math.min(beat + 1, s.beatCount)} of ${s.beatCount}`}
                >
                  {"▮".repeat(Math.min(beat + 1, s.beatCount))}
                  {"▯".repeat(Math.max(s.beatCount - beat - 1, 0))}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {s.document && (
            <button
              className="btn px-2 py-1.5 text-xs"
              onClick={() => setShowDoc(true)}
              data-tour="doc-btn"
            >
              <FileText className="h-3.5 w-3.5" /> Lease
            </button>
          )}
          <button
            className="btn px-2 py-1.5 text-xs"
            onClick={() => nav("/gauntlet")}
            aria-label="Leave round"
            data-tour="leave-round"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3 min-h-0">
        {/* scene intro */}
        <div className="paper-card p-4" data-tour="scene">
          <p className="stamp-text text-[10px] text-redink font-bold">THE SCENE</p>
          <p className="text-sm mt-1 leading-snug">{s.setup}</p>
          {!introSeen && (
            <button
              className="btn px-3 py-1 text-[11px] mt-3"
              onClick={() => setIntroSeen(true)}
            >
              I'm ready
            </button>
          )}
        </div>

        {messages.map((m) =>
          m.role === "adversary" ? (
            <div key={m.id} className="max-w-[88%] sm:max-w-[80%]" data-tour="adversary-msg">
              <div className="paper-card shadow-none border-l-4 border-l-redink p-3 relative group">
                <p className="font-mono text-[10px] uppercase tracking-wider text-redink/80">
                  {s.adversaryName}
                </p>
                <p className="text-sm mt-1 whitespace-pre-wrap leading-snug">{m.content}</p>
                <button
                  onClick={() => setPicker(m.id)}
                  data-tour="flag-btn"
                  className="absolute -right-2.5 -top-2.5 h-9 w-9 rounded-full border-2 border-ink bg-paper-bright
                    flex items-center justify-center hover:bg-amber/20 active:bg-amber/30 focus-visible:outline focus-visible:outline-2"
                  aria-label="Flag this message with a tactic"
                  title="Call it out"
                >
                  <Flag className="h-4 w-4" />
                </button>
              </div>
              {(m.flagged ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {m.flagged!.map((t) => (
                    <span
                      key={t}
                      className="stamp-text text-[9px] font-bold text-amber border-2 border-amber rounded-sm px-1.5 py-0.5"
                    >
                      ⚑ {tacticName(t).toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div key={m.id} className="max-w-[88%] sm:max-w-[80%] ml-auto">
              <div className="border-2 border-ink rounded-md p-3 bg-paper">
                <p className="text-sm whitespace-pre-wrap leading-snug">{m.content}</p>
              </div>
            </div>
          )
        )}

        {draft !== null && (
          <div className="max-w-[88%] sm:max-w-[80%]" data-tour="draft">
            <div className="paper-card shadow-none border-l-4 border-l-redink p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-redink/80">
                {s.adversaryName}
              </p>
              <p className="text-sm mt-1 whitespace-pre-wrap leading-snug">
                {draft}
                <span className="animate-pulse">▌</span>
              </p>
            </div>
          </div>
        )}
        {deciding && (
          <div className="paper-card p-3 font-mono text-xs uppercase tracking-wider text-ink/60">
            The referee is reviewing the tape…
          </div>
        )}
      </div>

      {error && (
        <p className="text-redink font-mono text-xs py-1" role="alert">
          {error}
        </p>
      )}

      {/* composer + decisions */}
      <div className="border-t-2 border-ink py-3 space-y-2.5 safe-b">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Talk to ${s.adversaryName.split(" ")[0]}…`}
            disabled={deciding}
            autoFocus
            data-tour="composer"
            className="flex-1 border-2 border-ink rounded-md bg-paper-bright px-3 py-2.5 text-sm min-w-0"
            aria-label="Your message"
          />
          <button className="btn-ink px-4" disabled={busy || deciding || !input.trim()} data-tour="send">
            Send
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            {decisionReady ? "Decision time:" : "End it your way:"}
          </span>
          {s.decisions.map((d) => (
            <button
              key={d.id}
              onClick={() => decide(d.id)}
              disabled={busy || deciding}
              data-tour={`decision-${d.id}`}
              className={
                d.kind === "walk" ? "btn-green px-3 py-1.5 text-[11px]" : d.kind === "take" ? "btn-red px-3 py-1.5 text-[11px]" : "btn px-3 py-1.5 text-[11px]"
              }
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {picker !== null && (
        <FlagPicker
          already={messages.find((m) => m.id === picker)?.flagged ?? []}
          onPick={(t) => flag(picker, t)}
          onClose={() => setPicker(null)}
        />
      )}
      {showDoc && s.document && (
        <LeaseDoc
          doc={s.document}
          flaggedClauses={clauseFlags}
          onFlagClause={flagClause}
          onClose={() => setShowDoc(false)}
        />
      )}
    </div>
  );
}

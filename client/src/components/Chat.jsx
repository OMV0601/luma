import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { TACTIC_NAMES } from "./tactics.js";

/**
 * The negotiation view. Tactic annotations are collected live but hidden by
 * default ("training wheels off") — Coach Mode reveals them in real time.
 */
export default function Chat({ session, onFinished, onQuit }) {
  const { sessionId, scenario } = session;
  const [messages, setMessages] = useState(session.messages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [coachMode, setCoachMode] = useState(false);
  const [doc, setDoc] = useState(null);
  const [showDoc, setShowDoc] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (scenario.hasDocument) {
      api.scenarioDocument(scenario.id).then((r) => setDoc(r.document)).catch(() => {});
    }
  }, [scenario]);

  async function send(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const { message } = await api.sendMessage(sessionId, text);
      setMessages((m) => [...m, message]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function decide(decision) {
    if (busy || deciding) return;
    setDeciding(true);
    setError(null);
    try {
      const result = await api.decide(sessionId, decision);
      onFinished(result);
    } catch (err) {
      setError(err.message);
      setDeciding(false);
    }
  }

  const characterName = scenario.character.split(" — ")[0];

  return (
    <main className="chat">
      <div className="chat-head">
        <div>
          <h2>{scenario.title}</h2>
          <div className="chat-sub">{scenario.character}</div>
        </div>
        <div className="chat-controls">
          {doc && (
            <button className="btn ghost" onClick={() => setShowDoc(true)}>
              📄 Read the lease
            </button>
          )}
          <label className="coach-toggle">
            <input
              type="checkbox"
              checked={coachMode}
              onChange={(e) => setCoachMode(e.target.checked)}
            />
            Coach Mode
          </label>
          <button className="btn ghost" onClick={onQuit}>Quit</button>
        </div>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        <div className="scene-card">{scenario.userRole}</div>
        {messages.map((m, i) => (
          <div key={i} className={`bubble-row ${m.role}`}>
            <div className="bubble">
              {m.role === "adversary" && <div className="bubble-name">{characterName}</div>}
              <div className="bubble-text">{m.text}</div>
              {coachMode && m.annotations?.length > 0 && (
                <div className="bubble-tactics">
                  {m.annotations.map((a, j) => (
                    <span key={j} className="tactic-badge" title={a.explanation}>
                      ⚠ {TACTIC_NAMES[a.tacticId] || a.tacticId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="bubble-row adversary">
            <div className="bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        {deciding && <div className="scene-card">The referee is reviewing the round…</div>}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="chat-footer">
        <form className="chat-input" onSubmit={send}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Say something to ${characterName}…`}
            disabled={deciding}
            autoFocus
          />
          <button className="btn primary" disabled={busy || deciding || !input.trim()}>
            Send
          </button>
        </form>
        <div className="decision-bar">
          <span className="decision-label">End the encounter:</span>
          <button className="btn danger" disabled={deciding} onClick={() => decide("accept")}>
            {scenario.decisions.accept}
          </button>
          <button className="btn safe" disabled={deciding} onClick={() => decide("walk_away")}>
            {scenario.decisions.walkAway}
          </button>
        </div>
      </div>

      {showDoc && doc && (
        <div className="modal-backdrop" onClick={() => setShowDoc(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{doc.title}</h3>
              <button className="btn ghost" onClick={() => setShowDoc(false)}>✕ Close</button>
            </div>
            <pre className="doc-text">{doc.text}</pre>
          </div>
        </div>
      )}
    </main>
  );
}

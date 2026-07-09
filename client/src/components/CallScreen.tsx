import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Mic, MessageSquare } from "lucide-react";
import { speak, listenOnce, recognitionSupported } from "../voice";

/**
 * The Fraud Alert incoming-call UI. Full-viewport phone screen: caller ID
 * (scenario-driven — scammers spoof whoever they impersonate), pulsing
 * answer/decline with a real ring, waveform that animates only while the
 * caller is actually speaking (TTS lifecycle owned here), and tap-to-talk.
 * Voice is a layer — the parent Round owns all state, and "switch to text"
 * is always available.
 */

export interface CallerId {
  name: string;
  number: string;
}

const FALLBACK_CALLER: CallerId = { name: "UNKNOWN CALLER", number: "No caller ID" };

/**
 * Classic US ring cadence (2s on / 4s off, 440+480 Hz) via WebAudio.
 * Autoplay policy may keep the context suspended if the browser doesn't
 * count the preceding navigation click as a gesture — in that case we
 * silently skip; the ring is garnish, never load-bearing.
 */
function useRingTone(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: AudioContext | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let stopped = false;

    const ringOnce = () => {
      if (!ctx || ctx.state !== "running" || stopped) return;
      const gain = ctx.createGain();
      gain.gain.value = 0.04; // quiet — a phone across the room, not an alarm
      gain.connect(ctx.destination);
      for (const freq of [440, 480]) {
        const osc = ctx.createOscillator();
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      }
      setTimeout(() => gain.disconnect(), 2000);
    };

    try {
      ctx = new AudioContext();
      void ctx.resume().then(() => {
        ringOnce();
        interval = setInterval(ringOnce, 5000);
      });
      navigator.vibrate?.([400, 200, 400]);
    } catch {
      /* no audio — fine */
    }
    return () => {
      stopped = true;
      if (interval) clearInterval(interval);
      void ctx?.close().catch(() => {});
    };
  }, [enabled]);
}

export function IncomingCall({
  caller,
  onAnswer,
  onDecline,
}: {
  caller: CallerId | null;
  onAnswer: () => void;
  onDecline: () => void;
}) {
  const id = caller ?? FALLBACK_CALLER;
  useRingTone(true);
  return (
    <div className="fixed inset-0 z-40 bg-ink text-paper-bright flex flex-col items-center justify-between py-16 px-6">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-paper-bright/60">
          incoming call
        </p>
        <h2 className="font-display text-3xl mt-3">{id.name}</h2>
        <p className="font-mono text-sm mt-2 text-paper-bright/60">{id.number}</p>
      </div>
      <div className="text-7xl animate-pulse" aria-hidden>
        📞
      </div>
      <div className="flex items-center gap-16">
        <button
          onClick={onDecline}
          className="h-16 w-16 rounded-full bg-redink flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-paper-bright"
          aria-label="Decline call"
        >
          <PhoneOff className="h-7 w-7" />
        </button>
        <button
          onClick={onAnswer}
          className="h-16 w-16 rounded-full bg-verified flex items-center justify-center animate-bounce focus-visible:outline focus-visible:outline-2 focus-visible:outline-paper-bright"
          aria-label="Answer call"
        >
          <Phone className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-10" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full bg-paper-bright transition-all duration-300 ${active ? "wave-bar" : ""}`}
          style={{ height: active ? 32 : 6, animationDelay: `${i * 0.09}s` }}
        />
      ))}
    </div>
  );
}

export function InCall({
  callerName,
  caller,
  lastAdversaryLine,
  busy,
  onUserSpeech,
  onHangUp,
  onTransfer,
  onSwitchToText,
}: {
  callerName: string;
  caller: CallerId | null;
  /** the adversary's latest complete line ("" while one is streaming) */
  lastAdversaryLine: string;
  busy: boolean;
  onUserSpeech: (text: string) => void;
  onHangUp: () => void;
  onTransfer: () => void;
  onSwitchToText: () => void;
}) {
  const [listening, setListening] = useState(false);
  const [caption, setCaption] = useState("");
  /** true only while TTS is actually voicing a line — drives the waveform */
  const [talking, setTalking] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const canListen = recognitionSupported();
  const [typed, setTyped] = useState("");
  const id = caller ?? FALLBACK_CALLER;

  // Live call timer — a frozen 00:00 reads as a bug on camera.
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  // Speak each new adversary line. The waveform tracks the actual utterance
  // lifecycle; captions always render regardless (accessibility + TTS-less
  // browsers).
  useEffect(() => {
    if (!lastAdversaryLine) return;
    setCaption(lastAdversaryLine);
    setTalking(true);
    cancelRef.current = speak(lastAdversaryLine, () => setTalking(false));
    return () => {
      cancelRef.current?.();
      setTalking(false);
    };
  }, [lastAdversaryLine]);

  async function talk() {
    if (listening || busy) return;
    cancelRef.current?.(); // user interrupts the caller — cut the TTS
    setTalking(false);
    setListening(true);
    const heard = await listenOnce();
    setListening(false);
    if (heard) onUserSpeech(heard);
  }

  return (
    <div className="fixed inset-0 z-40 bg-ink text-paper-bright flex flex-col py-8 px-5">
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-redink">
          ⚠ unverified caller
        </p>
        <h2 className="font-display text-xl mt-1">{callerName}</h2>
        <p className="font-mono text-xs text-paper-bright/50 mt-1">
          {clock} · {id.name}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-0">
        <Waveform active={talking} />
        <p
          aria-live="polite"
          className="max-w-md text-center text-sm leading-relaxed text-paper-bright/90 overflow-y-auto max-h-48 px-2"
        >
          “{caption || "…"}”
        </p>
      </div>

      {/* Tap to talk / typed fallback */}
      <div className="space-y-3">
        {canListen ? (
          <button
            onClick={talk}
            disabled={busy}
            className={`w-full border-2 rounded-md py-3 font-mono text-sm uppercase tracking-wider
              flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-paper-bright ${
                listening ? "border-redink text-redink animate-pulse" : "border-paper-bright/60"
              } disabled:opacity-40`}
          >
            <Mic className="h-4 w-4" />
            {listening ? "Listening…" : busy ? "…" : "Hold the line — tap to speak"}
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typed.trim()) {
                onUserSpeech(typed.trim());
                setTyped("");
              }
            }}
            className="flex gap-2"
          >
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Say something…"
              className="flex-1 bg-transparent border-2 border-paper-bright/60 rounded-md px-3 py-2 text-sm"
            />
            <button className="border-2 border-paper-bright/60 rounded-md px-4 font-mono text-xs uppercase">
              Say
            </button>
          </form>
        )}

        <div className="flex gap-3">
          <button
            onClick={onHangUp}
            disabled={busy}
            className="flex-1 bg-verified text-ink border-2 border-verified rounded-md py-3 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2"
          >
            <PhoneOff className="h-4 w-4" /> Hang up & call my card
          </button>
          <button
            onClick={onTransfer}
            disabled={busy}
            className="flex-1 border-2 border-redink text-redink rounded-md py-3 font-mono text-xs uppercase tracking-wider font-bold"
          >
            Transfer the money
          </button>
        </div>
        <button
          onClick={onSwitchToText}
          className="w-full text-center font-mono text-[11px] uppercase tracking-wider text-paper-bright/50 py-1 flex items-center justify-center gap-1"
        >
          <MessageSquare className="h-3 w-3" /> switch to text chat
        </button>
      </div>
    </div>
  );
}

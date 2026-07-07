/**
 * Browser-native voice for The Fraud Alert: speechSynthesis for the caller,
 * SpeechRecognition (webkit) for the user. Feature-detected — callers must
 * check `voiceSupported()` and always offer the text fallback.
 */

/* Minimal ambient types — SpeechRecognition isn't in the standard DOM lib. */
interface SRResultEvent {
  results: { [i: number]: { [i: number]: { transcript: string } } };
}
interface SR {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SRResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
}

export function voiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function recognitionSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
}

/** Pick an urgent-sounding en-US voice; rate slightly above 1. */
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const preferred = ["Google US English", "Microsoft David", "Microsoft Mark", "Alex"];
  for (const name of preferred) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith("en-US")) ?? voices[0] ?? null;
}

export function speak(text: string, onEnd?: () => void): () => void {
  // TTS backends vary wildly (missing voices, no audio device). Captions
  // always render regardless, so a failed speak() must never take down the
  // call screen.
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) utter.voice = v;
    utter.rate = 1.05;
    utter.pitch = 0.95;
    if (onEnd) utter.onend = onEnd;
    synth.speak(utter);
    return () => synth.cancel();
  } catch {
    onEnd?.();
    return () => {};
  }
}

type RecognitionCtor = new () => SR;

/** One-shot tap-to-talk. Resolves with the transcript (or null). */
export function listenOnce(): Promise<string | null> {
  return new Promise((resolve) => {
    const Ctor: RecognitionCtor | undefined =
      (window as unknown as { SpeechRecognition?: RecognitionCtor }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: RecognitionCtor }).webkitSpeechRecognition;
    if (!Ctor) return resolve(null);
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => resolve(e.results[0][0].transcript);
    rec.onerror = () => resolve(null);
    rec.onend = () => resolve(null); // no result -> null (resolve is idempotent)
    rec.start();
  });
}

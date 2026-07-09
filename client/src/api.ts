/** Fetch wrapper + the SSE reader for streamed adversary replies. */
import type { RoundStart, StreamDone } from "./types";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body as T;
}

export const api = {
  signup: (username: string, password: string) =>
    request<{ user: unknown; isNew: boolean }>("/api/signup", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  login: (username: string, password: string) =>
    request<{ user: unknown; isNew: boolean }>("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  guest: () => request<{ user: unknown }>("/api/guest", { method: "POST" }),
  logout: () => request<{ ok: boolean }>("/api/logout", { method: "POST" }),
  me: <T>() => request<T>("/api/me"),
  scenarios: <T>() => request<T>("/api/scenarios"),
  startRound: (scenarioId: string, voiceMode = false) =>
    request<RoundStart>("/api/round", {
      method: "POST",
      body: JSON.stringify({ scenarioId, voiceMode }),
    }),
  flag: (sessionId: number, messageId: number, tacticId: string) =>
    request<{ flag: { id: number } }>(`/api/round/${sessionId}/flag`, {
      method: "POST",
      body: JSON.stringify({ messageId, tacticId }),
    }),
  decide: (sessionId: number, decision: string) =>
    request<{ resultId: number; sessionId: number }>(`/api/round/${sessionId}/decide`, {
      method: "POST",
      body: JSON.stringify({ decision }),
    }),
  debrief: <T>(sessionId: number | string) => request<T>(`/api/debrief/${sessionId}`),
  profile: <T>() => request<T>("/api/profile"),
  codex: <T>() => request<T>("/api/codex"),
};

/**
 * POST the user's message and consume the SSE reply stream.
 * onDelta fires per text chunk; resolves with the `done` frame.
 */
export async function streamMessage(
  sessionId: number,
  content: string,
  onDelta: (text: string) => void
): Promise<StreamDone> {
  const res = await fetch(`/api/round/${sessionId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ content }),
  });
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Stream failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done: StreamDone | null = null;

  for (;;) {
    const { value, done: eof } = await reader.read();
    if (eof) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE frames are separated by a blank line.
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const line = frame.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const payload = JSON.parse(line.slice(6));
      if (payload.delta) onDelta(payload.delta);
      if (payload.done) done = payload as StreamDone;
    }
  }
  if (!done) throw new Error("Stream ended without a done frame");
  return done;
}

export const usd = (n: number) =>
  Math.abs(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

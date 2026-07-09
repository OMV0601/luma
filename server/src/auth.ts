/**
 * Password hashing with Node's built-in scrypt — no dependency, no native
 * build (unlike bcrypt), so it deploys anywhere the app already runs.
 * Stored format: "<salt-hex>:<hash-hex>". Guests have no password.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, salt, KEYLEN);
  // Constant-time compare; length-guard first (timingSafeEqual throws on mismatch).
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Basic strength gate — enough to be real, not enough to annoy a demo. */
export function validateCredentials(username: string, password: string): string | null {
  if (username.length < 3) return "Username must be at least 3 characters.";
  if (username.length > 24) return "Username must be 24 characters or fewer.";
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) return "Username: letters, numbers, . _ - only.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (password.length > 128) return "Password is too long.";
  return null;
}

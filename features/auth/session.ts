import { createPersistedStore } from "@/shared/lib/persisted-store";
import { STORAGE } from "@/shared/lib/storage-keys";

/**
 * Mock session until the auth provider is decided (see docs/PLAN.md open questions).
 * Any valid-looking email and any password signs in, except the two test cases below that fail the way
 * a real sign-in can; the session lives in localStorage (with an in-memory fallback if storage is blocked).
 * Replace `signIn` / `signOut` / `readSessionRaw` when real auth exists; callers stay the same.
 */

export interface Session {
  /** Stable id of the signed-in user, recorded as `roId` on saved results. The mock uses the email. */
  userId: string;
  email: string;
  /** Initials for the header avatar. */
  initials: string;
}

const store = createPersistedStore(STORAGE.session);

export function initialsOf(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : local.slice(0, 2);
  return (letters || "?").toUpperCase();
}

/** Errors are codes, not text, so the UI can translate them (messages `auth.error.*`). */
export type SignInError = "invalidEmail" | "missingPassword" | "invalidCredentials";
export type SignInResult = { ok: true; session: Session } | { ok: false; error: SignInError };

/**
 * Test cases for the failed sign-in message (the mock accepts everything else):
 * - the password `wrong`, with any email: wrong credentials;
 * - the email `nopermission@example.fi`, with any password: right credentials but no permission.
 * Both give the same `invalidCredentials` error, so the app never reveals which one it was.
 */
export const MOCK_WRONG_PASSWORD = "wrong";
export const MOCK_NO_PERMISSION_EMAIL = "nopermission@example.fi";

export function mockRejects(email: string, password: string): boolean {
  return password === MOCK_WRONG_PASSWORD || email.trim().toLowerCase() === MOCK_NO_PERMISSION_EMAIL;
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const trimmed = email.trim();
  if (!/^\S+@\S+\.\S+$/.test(trimmed)) return { ok: false, error: "invalidEmail" };
  if (password.length === 0) return { ok: false, error: "missingPassword" };
  if (mockRejects(trimmed, password)) return { ok: false, error: "invalidCredentials" };
  const session: Session = { userId: trimmed.toLowerCase(), email: trimmed, initials: initialsOf(trimmed) };
  store.write(JSON.stringify(session));
  return { ok: true, session };
}

/** The stored session as a raw string (a stable primitive, safe for useSyncExternalStore), or null. */
export function readSessionRaw(): string | null {
  return store.read();
}

export function parseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<Session>;
    // A session stored before userId existed has none: the email was its id.
    return typeof value.email === "string" && typeof value.initials === "string"
      ? {
          userId: typeof value.userId === "string" ? value.userId : value.email.toLowerCase(),
          email: value.email,
          initials: value.initials,
        }
      : null;
  } catch {
    return null;
  }
}

export function subscribeSession(onChange: () => void): () => void {
  return store.subscribe(onChange);
}

export function signOut(): void {
  store.remove();
}

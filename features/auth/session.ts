/**
 * Mock session until the auth provider is decided (see docs/PLAN.md open questions).
 * Any non-empty email and password signs in; the session lives in localStorage.
 * Replace `signIn` / `signOut` / `readSession` when real auth exists; callers stay the same.
 */

export interface Session {
  email: string;
  /** Initials for the header avatar. */
  initials: string;
}

const KEY = "turres-scorer.session";

export function initialsOf(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : local.slice(0, 2);
  return (letters || "?").toUpperCase();
}

/** Errors are codes, not text, so the UI can translate them (messages `auth.error.*`). */
export type SignInError = "invalidEmail" | "missingPassword";
export type SignInResult = { ok: true; session: Session } | { ok: false; error: SignInError };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const trimmed = email.trim();
  if (!/^\S+@\S+\.\S+$/.test(trimmed)) return { ok: false, error: "invalidEmail" };
  if (password.length === 0) return { ok: false, error: "missingPassword" };
  const session: Session = { email: trimmed, initials: initialsOf(trimmed) };
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Storage can be blocked (private mode); the app still works for this page load.
  }
  return { ok: true, session };
}

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function signOut(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialsOf, parseSession, readSessionRaw, signIn, signOut } from "./session";

describe("initialsOf", () => {
  it("uses first letters of dotted names", () => expect(initialsOf("ro.virtanen@example.fi")).toBe("RV"));
  it("falls back to the first two letters", () => expect(initialsOf("antti@example.fi")).toBe("AN"));
  it("handles an empty local part", () => expect(initialsOf("@example.fi")).toBe("?"));
});

describe("parseSession", () => {
  it("reads a stored session", () => {
    const raw = JSON.stringify({ userId: "ro@example.fi", email: "Ro@Example.fi", initials: "RO" });
    expect(parseSession(raw)).toEqual({ userId: "ro@example.fi", email: "Ro@Example.fi", initials: "RO" });
  });

  it("gives a session stored before userId existed the lower-cased email as its id", () => {
    const legacy = JSON.stringify({ email: "Ro.Virtanen@Example.fi", initials: "RV" });
    expect(parseSession(legacy)?.userId).toBe("ro.virtanen@example.fi");
  });

  it("rejects empty, broken and incomplete values", () => {
    expect(parseSession(null)).toBeNull();
    expect(parseSession("")).toBeNull();
    expect(parseSession("{not json")).toBeNull();
    expect(parseSession(JSON.stringify({ email: "a@b.fi" }))).toBeNull();
  });
});

describe("signIn and signOut", () => {
  beforeEach(() => {
    const data = new Map<string, string>();
    vi.stubGlobal("window", new EventTarget());
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("stores a session whose user id is the lower-cased email", async () => {
    const result = await signIn("  Ro.Virtanen@Example.fi ", "secret");
    expect(result).toMatchObject({ ok: true, session: { userId: "ro.virtanen@example.fi", initials: "RV" } });
    expect(parseSession(readSessionRaw())?.userId).toBe("ro.virtanen@example.fi");
  });

  it("rejects an invalid email and an empty password without storing anything", async () => {
    expect(await signIn("not-an-email", "x")).toEqual({ ok: false, error: "invalidEmail" });
    expect(await signIn("a@b.fi", "")).toEqual({ ok: false, error: "missingPassword" });
    expect(readSessionRaw()).toBeNull();
  });

  it("signOut clears the session", async () => {
    await signIn("a@b.fi", "x");
    signOut();
    expect(readSessionRaw()).toBeNull();
  });
});

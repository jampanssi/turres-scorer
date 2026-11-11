import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  initialsOf,
  MOCK_NO_PERMISSION_EMAIL,
  MOCK_WRONG_PASSWORD,
  mockRejects,
  parseSession,
  readSessionRaw,
  signIn,
  signOut,
} from "./session";

describe("initialsOf", () => {
  it("uses first letters of dotted names", () => expect(initialsOf("ro.virtanen@example.fi")).toBe("RV"));
  it("falls back to the first two letters", () => expect(initialsOf("antti@example.fi")).toBe("AN"));
  it("handles an empty local part", () => expect(initialsOf("@example.fi")).toBe("?"));
});

describe("mockRejects", () => {
  it("rejects exactly the wrong test password and the no-permission test email", () => {
    expect(mockRejects("a@b.fi", "wrong")).toBe(true);
    expect(mockRejects("NoPermission@Example.fi", "x")).toBe(true);
    expect(mockRejects("a@b.fi", "secret")).toBe(false);
    expect(mockRejects("permission@example.fi", "x")).toBe(false);
  });
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

  it("fails with the same error for a wrong password and for a user without permission, and stores nothing", async () => {
    const wrongPassword = await signIn("ro@example.fi", MOCK_WRONG_PASSWORD);
    const noPermission = await signIn(`  ${MOCK_NO_PERMISSION_EMAIL.toUpperCase()} `, "secret");
    expect(wrongPassword).toEqual({ ok: false, error: "invalidCredentials" });
    expect(noPermission).toEqual(wrongPassword); // identical: the app cannot tell the two apart
    expect(readSessionRaw()).toBeNull();
  });

  it("still signs in with any other email and password", async () => {
    expect(await signIn("ro@example.fi", "Wrong")).toMatchObject({ ok: true }); // only the exact test password fails
    expect(await signIn("nopermission2@example.fi", "secret")).toMatchObject({ ok: true });
  });

  it("signOut clears the session", async () => {
    await signIn("a@b.fi", "x");
    signOut();
    expect(readSessionRaw()).toBeNull();
  });
});

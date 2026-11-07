import { describe, expect, it } from "vitest";
import { initialsOf } from "./session";

describe("initialsOf", () => {
  it("uses first letters of dotted names", () => expect(initialsOf("ro.virtanen@example.fi")).toBe("RV"));
  it("falls back to the first two letters", () => expect(initialsOf("antti@example.fi")).toBe("AN"));
  it("handles an empty local part", () => expect(initialsOf("@example.fi")).toBe("?"));
});

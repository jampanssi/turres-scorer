import { describe, expect, it } from "vitest";
import { formatDate, formatHitFactor, formatMatchDate, formatTime, parseTime } from "./format";

describe("format", () => {
  it("HF has 4 decimals", () => expect(formatHitFactor(6.41330)).toBe("6.4133"));
  it("time has 2 decimals", () => expect(formatTime(8.4)).toBe("8.40 s"));
  it("parses . and , decimals", () => {
    expect(parseTime("8.42")).toBe(8.42);
    expect(parseTime("8,42")).toBe(8.42);
  });
  it("returns null for empty or invalid time", () => {
    expect(parseTime("")).toBeNull();
    expect(parseTime("abc")).toBeNull();
  });
  it("formats short dates without year or leading zeros", () => {
    expect(formatMatchDate("2026-11-07")).toBe("7.11");
    expect(formatMatchDate("2026-01-05")).toBe("5.1");
  });
  it("formats dates with year in Finnish style", () => expect(formatDate("2026-11-07")).toBe("7.11.2026"));
});

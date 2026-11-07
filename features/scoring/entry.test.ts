import { describe, expect, it } from "vitest";
import type { HitCode } from "@/shared/domain/types";
import { addPaperHit, paperRemaining, steelRemaining, undoPaperHit } from "./entry";

/** Tap the given hits in order on a row of a stage that needs `required` hits per paper target. */
const tap = (required: number, row: HitCode[], ...hits: HitCode[]) =>
  hits.reduce((current, hit) => addPaperHit(current, hit, required), row);

describe("paper row FIFO with 2 hits per target (the usual stage)", () => {
  it("AA + C -> AC", () => expect(tap(2, ["A", "A"], "C")).toEqual(["A", "C"]));
  it("AA + C, M -> CM", () => expect(tap(2, ["A", "A"], "C", "M")).toEqual(["C", "M"]));
  it("AA + C, C -> CC", () => expect(tap(2, ["A", "A"], "C", "C")).toEqual(["C", "C"]));
  it("fills an empty row up to two entries", () => {
    expect(tap(2, [], "A")).toEqual(["A"]);
    expect(tap(2, [], "A", "D")).toEqual(["A", "D"]);
  });
});

describe("paper row with 1 hit per target", () => {
  it("each tap replaces the previous hit", () => {
    expect(tap(1, [], "A")).toEqual(["A"]);
    expect(tap(1, ["A"], "C")).toEqual(["C"]);
    expect(tap(1, [], "A", "M", "D")).toEqual(["D"]);
  });
});

describe("paper row with 3 hits per target", () => {
  it("fills up to three entries", () => {
    expect(tap(3, [], "A", "A", "C")).toEqual(["A", "A", "C"]);
  });
  it("AAA + C -> AAC, then + M -> ACM (the oldest drops)", () => {
    expect(tap(3, ["A", "A", "A"], "C")).toEqual(["A", "A", "C"]);
    expect(tap(3, ["A", "A", "A"], "C", "M")).toEqual(["A", "C", "M"]);
  });
});

describe("undo and completeness", () => {
  it("undo removes the most recent entry", () => expect(undoPaperHit(["A", "C"])).toEqual(["A"]));
  it("undo on an empty row stays empty", () => expect(undoPaperHit([])).toEqual([]));

  it("paper rows report N left for the stage's hits per target", () => {
    expect(paperRemaining([], 2)).toBe(2);
    expect(paperRemaining(["A"], 2)).toBe(1);
    expect(paperRemaining(["A", "C"], 2)).toBe(0);

    expect(paperRemaining([], 1)).toBe(1);
    expect(paperRemaining(["A"], 1)).toBe(0);

    expect(paperRemaining([], 3)).toBe(3);
    expect(paperRemaining(["A", "C"], 3)).toBe(1);
    expect(paperRemaining(["A", "C", "D"], 3)).toBe(0);
  });

  it("steel rows report 1 left until set", () => {
    expect(steelRemaining(null)).toBe(1);
    expect(steelRemaining("A")).toBe(0);
  });
});

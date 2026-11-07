import { describe, expect, it } from "vitest";
import type { HitCode } from "@/shared/domain/types";
import { addPaperHit, paperRemaining, steelRemaining, undoPaperHit } from "./entry";

const tap = (row: HitCode[], ...hits: HitCode[]) => hits.reduce(addPaperHit, row);

describe("paper row FIFO", () => {
  it("AA + C -> AC", () => expect(tap(["A", "A"], "C")).toEqual(["A", "C"]));
  it("AA + C, M -> CM", () => expect(tap(["A", "A"], "C", "M")).toEqual(["C", "M"]));
  it("AA + C, C -> CC", () => expect(tap(["A", "A"], "C", "C")).toEqual(["C", "C"]));
  it("fills an empty row up to two entries", () => {
    expect(tap([], "A")).toEqual(["A"]);
    expect(tap([], "A", "D")).toEqual(["A", "D"]);
  });
});

describe("undo and completeness", () => {
  it("undo removes the most recent entry", () => expect(undoPaperHit(["A", "C"])).toEqual(["A"]));
  it("undo on an empty row stays empty", () => expect(undoPaperHit([])).toEqual([]));
  it("paper rows report N left", () => {
    expect(paperRemaining([])).toBe(2);
    expect(paperRemaining(["A"])).toBe(1);
    expect(paperRemaining(["A", "C"])).toBe(0);
  });
  it("steel rows report 1 left until set", () => {
    expect(steelRemaining(null)).toBe(1);
    expect(steelRemaining("A")).toBe(0);
  });
});

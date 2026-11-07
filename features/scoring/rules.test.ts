import { describe, expect, it } from "vitest";
import { codePoints, hitFactor, maxNoShoots, maxProcedurals, pointsOf, totalsOf } from "./rules";

describe("points", () => {
  it("scores A=5, C=3, D=1", () => {
    const t = totalsOf({ paper: [["A", "C"], ["D", "D"]], steel: ["A"], noShoots: 0, procedurals: 0 });
    expect(t).toEqual({ A: 2, C: 1, D: 2, M: 0, NS: 0, PE: 0 });
    expect(pointsOf(t)).toBe(15);
  });
  it("subtracts 10 per miss, no-shoot and procedural", () => {
    const t = totalsOf({ paper: [["A", "M"]], steel: ["M"], noShoots: 1, procedurals: 1 });
    expect(pointsOf(t)).toBe(0); // 5 - 40 -> clamped
  });
  it("never goes negative", () => {
    expect(pointsOf({ A: 0, C: 0, D: 0, M: 3, NS: 0, PE: 0 })).toBe(0);
  });
});

describe("hit factor", () => {
  it("is points / time", () => expect(hitFactor(54, 8.42)).toBeCloseTo(6.4133, 4));
  it("is 0 for empty or non-positive time", () => {
    expect(hitFactor(54, null)).toBe(0);
    expect(hitFactor(54, 0)).toBe(0);
    expect(hitFactor(54, -1)).toBe(0);
  });
});

describe("penalty limits", () => {
  it("no-shoot max is 2 per target", () => expect(maxNoShoots(2)).toBe(4));
  it("procedural max: 6 paper (2 hits) + 3 steel -> 8", () => expect(maxProcedurals(6, 3, 2)).toBe(8));
  it("procedural max follows the hits per paper target", () => {
    expect(maxProcedurals(4, 2, 1)).toBe(3); // 4 x 1 x 5 + 2 x 5 = 30 points
    expect(maxProcedurals(6, 2, 3)).toBe(10); // 6 x 3 x 5 + 2 x 5 = 100 points
  });
});

describe("codePoints", () => {
  it("gives points per code: A, C, D add and M, NS, PE subtract", () => {
    expect(codePoints({ A: 11, C: 3, D: 2, M: 1, NS: 1, PE: 2 })).toEqual({ A: 55, C: 9, D: 2, M: -10, NS: -10, PE: -20 });
  });
  it("adds up to the stage points before the zero floor", () => {
    expect(pointsOf({ A: 11, C: 3, D: 0, M: 1, NS: 0, PE: 0 })).toBe(54);
  });
});

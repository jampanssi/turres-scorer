import { describe, expect, it } from "vitest";
import type { HitCode } from "@/shared/domain/types";
import {
  addPaperHit,
  DEFAULT_STEEL_HIT,
  formatPaperHits,
  paperRemaining,
  setSteelHit,
  steelRemaining,
  undoPaperHit,
  undoSteelHit,
} from "./entry";

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

  it("a steel target starts as a hit, and undo returns to that", () => {
    expect(DEFAULT_STEEL_HIT).toBe("A");
    expect(undoSteelHit()).toBe("A");
    expect(undoSteelHit()).toBe(setSteelHit("A"));
    expect(steelRemaining(DEFAULT_STEEL_HIT)).toBe(0); // so a fresh steel row counts as complete
  });
});

describe("a tap on a full row replaces a hit that differs", () => {
  it("fixing a hit takes one tap: AC + A -> AA (a plain 'drop the oldest' would give CA, the same hits again)", () => {
    expect(tap(2, ["A", "C"], "A")).toEqual(["A", "A"]);
    expect(tap(2, ["C", "A"], "A")).toEqual(["A", "A"]);
    expect(tap(2, ["A", "M"], "A")).toEqual(["A", "A"]);
  });

  it("the other direction works too: AA + C -> AC, AC + C -> CC, AM + C -> MC (one hit is replaced)", () => {
    expect(tap(2, ["A", "A"], "C")).toEqual(["A", "C"]);
    expect(tap(2, ["A", "C"], "C")).toEqual(["C", "C"]);
    expect(tap(2, ["A", "M"], "C")).toEqual(["M", "C"]); // only the oldest hit that differs goes
  });

  it("tapping the code the whole row already holds changes nothing", () => {
    expect(tap(2, ["A", "A"], "A")).toEqual(["A", "A"]);
    expect(tap(1, ["D"], "D")).toEqual(["D"]);
    expect(tap(3, ["C", "C", "C"], "C")).toEqual(["C", "C", "C"]);
  });

  it("with three hits it drops the oldest hit that is not the tapped code", () => {
    expect(tap(3, ["A", "C", "D"], "A")).toEqual(["A", "D", "A"]); // C is replaced, the first A stays (same hits as AAD)
    expect(tap(3, ["A", "C", "D"], "D")).toEqual(["C", "D", "D"]); // A is the oldest that is not D
    expect(tap(3, ["A", "A", "C"], "C")).toEqual(["A", "C", "C"]);
    expect(tap(3, ["A", "C", "D"], "M")).toEqual(["C", "D", "M"]); // nothing equals M: the oldest goes
  });

  it("with one hit per target a tap always replaces it", () => {
    expect(tap(1, ["A"], "C")).toEqual(["C"]);
    expect(tap(1, ["C"], "M")).toEqual(["M"]);
  });

  it("never grows a row beyond what the stage needs, and never changes the row it was given", () => {
    const row: HitCode[] = ["A", "C"];
    tap(2, row, "A", "D", "M");
    expect(row).toEqual(["A", "C"]);
    for (const taps of [
      ["A", "C", "D", "M", "A", "A", "C"],
      ["M", "M", "M", "D", "D"],
    ] as HitCode[][]) {
      expect(tap(2, [], ...taps).length).toBeLessThanOrEqual(2);
      expect(tap(3, [], ...taps).length).toBeLessThanOrEqual(3);
    }
  });

  it("a row that does not hold the code always ends up holding it (a tap is never wasted)", () => {
    const codes: HitCode[] = ["A", "C", "D", "M"];
    for (const first of codes)
      for (const second of codes)
        for (const tapped of codes) {
          expect(tap(2, [first, second], tapped)).toContain(tapped);
        }
  });
});

describe("formatPaperHits (how a row reads on Review)", () => {
  it("is alphabetical whatever order the hits were tapped in: CA reads AC, MA reads AM", () => {
    expect(formatPaperHits(["C", "A"])).toBe("AC");
    expect(formatPaperHits(["M", "A"])).toBe("AM");
    expect(formatPaperHits(["M", "D"])).toBe("DM");
    expect(formatPaperHits(["D", "C", "A"])).toBe("ACD");
  });

  it("keeps equal hits together, and handles one hit and an empty row", () => {
    expect(formatPaperHits(["C", "C"])).toBe("CC");
    expect(formatPaperHits(["M"])).toBe("M");
    expect(formatPaperHits([])).toBe("");
  });

  it("does not reorder the row it was given", () => {
    const row: HitCode[] = ["C", "A"];
    formatPaperHits(row);
    expect(row).toEqual(["C", "A"]);
  });

  it("the same hits in any order read the same", () => {
    expect(formatPaperHits(["A", "C"])).toBe(formatPaperHits(["C", "A"]));
  });
});

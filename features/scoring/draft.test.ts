import { describe, expect, it } from "vitest";
import { dnfResult, dqResult } from "@/shared/domain/test-fixtures";
import type { ScoredStageScore } from "@/shared/domain/types";
import {
  appendTimeDigit,
  backspaceTimeDigit,
  clearTimeDigits,
  digitsFromSeconds,
  draftFromScore,
  emptyDraft,
  formatTimeDigits,
  isSameDraft,
  secondsFromDigits,
  setNoShoots,
  setProcedurals,
  tapPaper,
  tapSteel,
  undoPaper,
  undoSteel,
} from "./draft";

// Stage 3 of the mock-ups: 6 paper, 3 steel, 2 no-shoots (no-shoot max 4, procedural max 8).
const stage = { paperTargets: 6, hitsPerPaperTarget: 2 as const, steelTargets: 3, noShootTargets: 2 };

describe("emptyDraft", () => {
  it("has an empty row per target", () => {
    const draft = emptyDraft(stage);
    expect(draft.paper).toEqual([[], [], [], [], [], []]);
    expect(draft.steel).toEqual([null, null, null]);
    expect(draft).toMatchObject({ timeDigits: "", noShoots: 0, procedurals: 0 });
  });
});

describe("paper rows", () => {
  it("adds taps and keeps the two most recent (FIFO)", () => {
    let draft = emptyDraft(stage);
    draft = tapPaper(tapPaper(draft, 0, "A", 2), 0, "A", 2);
    expect(draft.paper[0]).toEqual(["A", "A"]);
    draft = tapPaper(draft, 0, "C", 2);
    expect(draft.paper[0]).toEqual(["A", "C"]);
    draft = tapPaper(draft, 0, "M", 2);
    expect(draft.paper[0]).toEqual(["C", "M"]);
  });

  it("only changes the tapped row", () => {
    const draft = tapPaper(emptyDraft(stage), 2, "D", 2);
    expect(draft.paper.map((r) => r.length)).toEqual([0, 0, 1, 0, 0, 0]);
  });

  it("undo removes the most recent entry of that row", () => {
    const draft = undoPaper(tapPaper(tapPaper(emptyDraft(stage), 1, "A", 2), 1, "C", 2), 1);
    expect(draft.paper[1]).toEqual(["A"]);
  });

  it("ignores rows that do not exist", () => {
    const draft = emptyDraft(stage);
    expect(tapPaper(draft, 9, "A", 2)).toBe(draft);
    expect(undoPaper(draft, -1)).toBe(draft);
  });

  it("does not change the previous draft", () => {
    const before = emptyDraft(stage);
    tapPaper(before, 0, "A", 2);
    expect(before.paper[0]).toEqual([]);
  });
});

describe("steel rows", () => {
  it("tapping sets A or M, replacing the other", () => {
    let draft = tapSteel(emptyDraft(stage), 0, "A");
    expect(draft.steel[0]).toBe("A");
    draft = tapSteel(draft, 0, "M");
    expect(draft.steel[0]).toBe("M");
  });
  it("undo clears the row", () => {
    expect(undoSteel(tapSteel(emptyDraft(stage), 1, "A"), 1).steel[1]).toBeNull();
  });
});

describe("penalties", () => {
  it("clamps no-shoots to 2 per target", () => {
    const draft = emptyDraft(stage);
    expect(setNoShoots(draft, 3, stage).noShoots).toBe(3);
    expect(setNoShoots(draft, 9, stage).noShoots).toBe(4);
    expect(setNoShoots(draft, -2, stage).noShoots).toBe(0);
  });
  it("clamps procedurals to ceil(maxPoints / 10) (6 paper + 3 steel -> 8)", () => {
    const draft = emptyDraft(stage);
    expect(setProcedurals(draft, 8, stage).procedurals).toBe(8);
    expect(setProcedurals(draft, 20, stage).procedurals).toBe(8);
  });
  it("allows no no-shoots on a stage without no-shoot targets", () => {
    expect(setNoShoots(emptyDraft(stage), 1, { ...stage, noShootTargets: 0 }).noShoots).toBe(0);
  });
});

describe("draftFromScore", () => {
  const saved: ScoredStageScore = {
    id: "st:sh",
    matchId: "m",
    stageId: "st",
    shooterId: "sh",
    roId: "ro",
    status: "scored",
    timeSec: 8.42,
    paper: [
      ["A", "A"],
      ["A", "C"],
    ],
    steel: ["A"],
    noShoots: 1,
    procedurals: 2,
    shooterAccepted: true,
    createdAt: "",
    updatedAt: "",
  };

  it("loads a saved score for correction, padding to the stage's target counts", () => {
    const draft = draftFromScore(saved, stage);
    expect(draft.timeDigits).toBe("842");
    expect(draft.paper).toHaveLength(6);
    expect(draft.paper[0]).toEqual(["A", "A"]);
    expect(draft.paper[5]).toEqual([]);
    expect(draft.steel).toEqual(["A", null, null]);
    expect(draft).toMatchObject({ noShoots: 1, procedurals: 2 });
  });

  it("starts empty with no score, or with a DNF or DQ result", () => {
    expect(draftFromScore(null, stage)).toEqual(emptyDraft(stage));
    expect(draftFromScore(dnfResult({ stageId: saved.stageId, shooterId: saved.shooterId }), stage)).toEqual(
      emptyDraft(stage),
    );
    expect(draftFromScore(dqResult({ stageId: saved.stageId, shooterId: saved.shooterId }), stage)).toEqual(
      emptyDraft(stage),
    );
  });

  it("shows no time digits for a time of 0", () => {
    expect(draftFromScore({ ...saved, timeSec: 0 }, stage).timeDigits).toBe("");
  });
});

describe("time keypad", () => {
  const type = (digits: string) => [...digits].reduce(appendTimeDigit, emptyDraft(stage));

  it("shifts digits in from the right, the last two being decimals: 8, 4, 2 -> 8.42", () => {
    expect(type("8").timeDigits).toBe("8");
    expect(formatTimeDigits(type("8").timeDigits)).toBe("0.08");
    expect(formatTimeDigits(type("84").timeDigits)).toBe("0.84");
    expect(formatTimeDigits(type("842").timeDigits)).toBe("8.42");
    expect(formatTimeDigits(type("1234").timeDigits)).toBe("12.34");
    expect(formatTimeDigits(type("12345").timeDigits)).toBe("123.45");
  });

  it("ignores digits beyond five (999.99 s is the maximum)", () => {
    expect(type("1234567").timeDigits).toBe("12345");
    expect(formatTimeDigits(type("99999").timeDigits)).toBe("999.99");
  });

  it("ignores leading zeros, so a typed 0 on an empty time changes nothing", () => {
    expect(type("0").timeDigits).toBe("");
    expect(type("007").timeDigits).toBe("7");
    expect(formatTimeDigits(type("007").timeDigits)).toBe("0.07");
  });

  it("keeps zeros that are not leading", () => {
    expect(formatTimeDigits(type("1005").timeDigits)).toBe("10.05");
    expect(formatTimeDigits(type("100").timeDigits)).toBe("1.00");
  });

  it("only accepts the digits 0-9", () => {
    const draft = emptyDraft(stage);
    expect(appendTimeDigit(draft, "a")).toBe(draft);
    expect(appendTimeDigit(draft, "12")).toBe(draft);
    expect(appendTimeDigit(draft, ".")).toBe(draft);
    expect(appendTimeDigit(draft, "")).toBe(draft);
  });

  it("backspace removes the last digit, down to empty", () => {
    let draft = type("842");
    draft = backspaceTimeDigit(draft);
    expect(formatTimeDigits(draft.timeDigits)).toBe("0.84");
    draft = backspaceTimeDigit(backspaceTimeDigit(draft));
    expect(draft.timeDigits).toBe("");
    expect(backspaceTimeDigit(draft).timeDigits).toBe("");
  });

  it("converts to seconds and back", () => {
    expect(secondsFromDigits("842")).toBe(8.42);
    expect(secondsFromDigits("5")).toBe(0.05);
    expect(secondsFromDigits("")).toBeNull();
    expect(digitsFromSeconds(8.42)).toBe("842");
    expect(digitsFromSeconds(12.3)).toBe("1230");
    expect(digitsFromSeconds(0.05)).toBe("5");
    expect(digitsFromSeconds(null)).toBe("");
    expect(secondsFromDigits(digitsFromSeconds(23.07))).toBe(23.07);
  });

  it("shows nothing for an empty time", () => {
    expect(formatTimeDigits("")).toBe("");
  });
});

describe("hits per paper target set by the stage", () => {
  it("1 hit: a tap replaces the previous one", () => {
    let draft = tapPaper(emptyDraft(stage), 0, "A", 1);
    draft = tapPaper(draft, 0, "C", 1);
    expect(draft.paper[0]).toEqual(["C"]);
  });

  it("3 hits: keeps the three most recent taps", () => {
    let draft = emptyDraft(stage);
    for (const hit of ["A", "A", "A", "C", "M"] as const) draft = tapPaper(draft, 1, hit, 3);
    expect(draft.paper[1]).toEqual(["A", "C", "M"]);
  });

  it("procedural limit follows the hits: 4 paper x 1 hit + 2 steel -> 3", () => {
    const strongHand = { paperTargets: 4, hitsPerPaperTarget: 1 as const, steelTargets: 2, noShootTargets: 0 };
    expect(setProcedurals(emptyDraft(strongHand), 20, strongHand).procedurals).toBe(3);
  });

  it("procedural limit follows the hits: 6 paper x 3 hits + 2 steel -> 10", () => {
    const heavy = { paperTargets: 6, hitsPerPaperTarget: 3 as const, steelTargets: 2, noShootTargets: 3 };
    expect(setProcedurals(emptyDraft(heavy), 20, heavy).procedurals).toBe(10);
  });

  it("a saved score with more hits than the stage asks for is trimmed to the most recent ones", () => {
    const oneHit = { paperTargets: 2, hitsPerPaperTarget: 1 as const, steelTargets: 0, noShootTargets: 0 };
    const saved: ScoredStageScore = {
      id: "st:sh",
      matchId: "m",
      stageId: "st",
      shooterId: "sh",
      roId: "ro",
      status: "scored",
      timeSec: 5,
      paper: [
        ["A", "C"],
        ["M", "D"],
      ],
      steel: [],
      noShoots: 0,
      procedurals: 0,
      shooterAccepted: true,
      createdAt: "",
      updatedAt: "",
    };
    expect(draftFromScore(saved, oneHit).paper).toEqual([["C"], ["D"]]);
  });
});

describe("isSameDraft", () => {
  const stage = { paperTargets: 2, steelTargets: 1, noShootTargets: 1, hitsPerPaperTarget: 2 } as const;

  it("is true for an untouched copy and false after any change", () => {
    const start = emptyDraft(stage);
    expect(isSameDraft(start, emptyDraft(stage))).toBe(true);
    expect(isSameDraft(start, appendTimeDigit(start, "5"))).toBe(false);
    expect(isSameDraft(start, tapPaper(start, 0, "A", 2))).toBe(false);
    expect(isSameDraft(start, tapSteel(start, 0, "A"))).toBe(false);
    expect(isSameDraft(start, setNoShoots(start, 1, stage))).toBe(false);
    expect(isSameDraft(start, setProcedurals(start, 1, stage))).toBe(false);
  });

  it("is true again when a change is undone", () => {
    const start = emptyDraft(stage);
    expect(isSameDraft(start, undoPaper(tapPaper(start, 0, "A", 2), 0))).toBe(true);
  });
});

describe("clearTimeDigits", () => {
  it("removes the whole time and nothing else", () => {
    const draft = setProcedurals(appendTimeDigit(appendTimeDigit(emptyDraft(stage), "8"), "4"), 1, stage);
    const cleared = clearTimeDigits(draft);
    expect(cleared.timeDigits).toBe("");
    expect(cleared.procedurals).toBe(1);
  });
});

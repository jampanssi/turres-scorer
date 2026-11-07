import { describe, expect, it } from "vitest";
import type { StageScore } from "@/shared/domain/types";
import {
  draftFromScore,
  emptyDraft,
  sanitizeTimeInput,
  setNoShoots,
  setProcedurals,
  tapPaper,
  tapSteel,
  undoPaper,
  undoSteel,
} from "./draft";

// Stage 3 of the mock-ups: 6 paper, 3 steel, 2 no-shoots (no-shoot max 4, procedural max 8).
const stage = { paperTargets: 6, steelTargets: 3, noShootTargets: 2 };

describe("emptyDraft", () => {
  it("has an empty row per target", () => {
    const draft = emptyDraft(stage);
    expect(draft.paper).toEqual([[], [], [], [], [], []]);
    expect(draft.steel).toEqual([null, null, null]);
    expect(draft).toMatchObject({ timeText: "", noShoots: 0, procedurals: 0 });
  });
});

describe("paper rows", () => {
  it("adds taps and keeps the two most recent (FIFO)", () => {
    let draft = emptyDraft(stage);
    draft = tapPaper(tapPaper(draft, 0, "A"), 0, "A");
    expect(draft.paper[0]).toEqual(["A", "A"]);
    draft = tapPaper(draft, 0, "C");
    expect(draft.paper[0]).toEqual(["A", "C"]);
    draft = tapPaper(draft, 0, "M");
    expect(draft.paper[0]).toEqual(["C", "M"]);
  });

  it("only changes the tapped row", () => {
    const draft = tapPaper(emptyDraft(stage), 2, "D");
    expect(draft.paper.map((r) => r.length)).toEqual([0, 0, 1, 0, 0, 0]);
  });

  it("undo removes the most recent entry of that row", () => {
    const draft = undoPaper(tapPaper(tapPaper(emptyDraft(stage), 1, "A"), 1, "C"), 1);
    expect(draft.paper[1]).toEqual(["A"]);
  });

  it("ignores rows that do not exist", () => {
    const draft = emptyDraft(stage);
    expect(tapPaper(draft, 9, "A")).toBe(draft);
    expect(undoPaper(draft, -1)).toBe(draft);
  });

  it("does not change the previous draft", () => {
    const before = emptyDraft(stage);
    tapPaper(before, 0, "A");
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
  const saved: StageScore = {
    id: "st:sh", matchId: "m", stageId: "st", shooterId: "sh", roId: "ro", status: "scored", timeSec: 8.42,
    paper: [["A", "A"], ["A", "C"]], steel: ["A"], noShoots: 1, procedurals: 2, shooterAccepted: true,
    createdAt: "", updatedAt: "",
  };

  it("loads a saved score for correction, padding to the stage's target counts", () => {
    const draft = draftFromScore(saved, stage);
    expect(draft.timeText).toBe("8.42");
    expect(draft.paper).toHaveLength(6);
    expect(draft.paper[0]).toEqual(["A", "A"]);
    expect(draft.paper[5]).toEqual([]);
    expect(draft.steel).toEqual(["A", null, null]);
    expect(draft).toMatchObject({ noShoots: 1, procedurals: 2 });
  });

  it("starts empty with no score, or with a DNF or DQ result", () => {
    expect(draftFromScore(null, stage)).toEqual(emptyDraft(stage));
    expect(draftFromScore({ ...saved, status: "dnf" }, stage)).toEqual(emptyDraft(stage));
    expect(draftFromScore({ ...saved, status: "dq" }, stage)).toEqual(emptyDraft(stage));
  });

  it("keeps an empty time empty", () => {
    expect(draftFromScore({ ...saved, timeSec: null }, stage).timeText).toBe("");
  });
});

describe("sanitizeTimeInput", () => {
  it("keeps digits and one separator", () => {
    expect(sanitizeTimeInput("8.42")).toBe("8.42");
    expect(sanitizeTimeInput("8,42")).toBe("8,42");
  });
  it("drops letters and extra separators", () => {
    expect(sanitizeTimeInput("a8.4b2")).toBe("8.42");
    expect(sanitizeTimeInput("8.4.2")).toBe("8.42");
    expect(sanitizeTimeInput("1,2,3")).toBe("1,23");
  });
  it("limits to two decimals and three integer digits", () => {
    expect(sanitizeTimeInput("8.4256")).toBe("8.42");
    expect(sanitizeTimeInput("12345")).toBe("123");
    expect(sanitizeTimeInput("12345.6")).toBe("123.6");
  });
  it("accepts a lone separator while typing", () => {
    expect(sanitizeTimeInput("8.")).toBe("8.");
    expect(sanitizeTimeInput("")).toBe("");
  });
});

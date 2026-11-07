import { describe, expect, it } from "vitest";
import type { StageScore } from "@/shared/domain/types";
import { draftFromScore, type ScoreDraft } from "./draft";
import { buildStageScore, summarizeDraft } from "./review";

const stage = { hitsPerPaperTarget: 2 as const };

/** The score from the mock-up: 8.42 s, 11 A, 3 C, 1 M -> 54 points, HF 6.4133. */
const mockUp: ScoreDraft = {
  timeDigits: "842",
  paper: [
    ["A", "A"],
    ["A", "C"],
    ["A", "A"],
    ["A", "C"],
    ["A", "M"],
    ["A", "C"],
  ],
  steel: ["A", "A", "A"],
  noShoots: 0,
  procedurals: 0,
};

describe("summarizeDraft", () => {
  it("matches the Review mock-up: 11 A, 3 C, 0 D, 1 M -> 54 points, HF 6.4133", () => {
    const s = summarizeDraft(mockUp, stage);
    expect(s.totals).toEqual({ A: 11, C: 3, D: 0, M: 1, NS: 0, PE: 0 });
    expect(s.codePoints).toEqual({ A: 55, C: 9, D: 0, M: -10, NS: 0, PE: 0 });
    expect(s.points).toBe(54);
    expect(s.seconds).toBe(8.42);
    expect(s.hitFactor).toBeCloseTo(6.4133, 4);
    expect(s.complete).toBe(true);
  });

  it("counts penalties in the points", () => {
    const s = summarizeDraft({ ...mockUp, noShoots: 1, procedurals: 2 }, stage);
    expect(s.codePoints).toMatchObject({ NS: -10, PE: -20 });
    expect(s.points).toBe(24); // 54 - 30
  });

  it("is not complete without a time", () => {
    const s = summarizeDraft({ ...mockUp, timeDigits: "" }, stage);
    expect(s).toMatchObject({ missingTime: true, seconds: null, hitFactor: 0, complete: false });
  });

  it("is not complete while targets are missing hits, and counts them", () => {
    const draft: ScoreDraft = {
      ...mockUp,
      paper: [["A", "A"], ["A"], [], ["A", "C"], ["A", "M"], ["A", "C"]],
      steel: ["A", null, "A"],
    };
    const s = summarizeDraft(draft, stage);
    expect(s.incompleteTargets).toBe(3); // paper 2 and 3, steel 2
    expect(s.complete).toBe(false);
  });

  it("follows the stage's hits per paper target", () => {
    const oneHit: ScoreDraft = { timeDigits: "500", paper: [["A"], ["C"]], steel: [], noShoots: 0, procedurals: 0 };
    expect(summarizeDraft(oneHit, { hitsPerPaperTarget: 1 }).complete).toBe(true);
    expect(summarizeDraft(oneHit, { hitsPerPaperTarget: 2 }).incompleteTargets).toBe(2);
  });

  it("a stage with no targets only needs a time", () => {
    const empty: ScoreDraft = { timeDigits: "300", paper: [], steel: [], noShoots: 0, procedurals: 0 };
    expect(summarizeDraft(empty, stage).complete).toBe(true);
  });
});

describe("buildStageScore", () => {
  const base = { draft: mockUp, matchId: "m", stageId: "st", shooterId: "sh", roId: "ro@example.fi" };

  it("builds the result to save, accepted by the shooter", () => {
    const score = buildStageScore({ ...base, now: "2026-11-07T10:00:00.000Z", existing: null });
    expect(score).toMatchObject({
      id: "st:sh",
      matchId: "m",
      stageId: "st",
      shooterId: "sh",
      roId: "ro@example.fi",
      status: "scored",
      timeSec: 8.42,
      noShoots: 0,
      procedurals: 0,
      shooterAccepted: true,
      createdAt: "2026-11-07T10:00:00.000Z",
      updatedAt: "2026-11-07T10:00:00.000Z",
    });
    expect(score.paper).toEqual(mockUp.paper);
    expect(score.steel).toEqual(["A", "A", "A"]);
  });

  it("copies the hits, so later draft changes do not alter the saved score", () => {
    const score = buildStageScore({ ...base, now: "t", existing: null });
    expect(score.paper).not.toBe(mockUp.paper);
    expect(score.paper[0]).not.toBe(mockUp.paper[0]);
  });

  it("keeps createdAt when correcting an existing score", () => {
    const existing = { createdAt: "2026-11-07T09:00:00.000Z" } as StageScore;
    const score = buildStageScore({ ...base, now: "2026-11-07T11:00:00.000Z", existing });
    expect(score.createdAt).toBe("2026-11-07T09:00:00.000Z");
    expect(score.updatedAt).toBe("2026-11-07T11:00:00.000Z");
  });
});

describe("a saved score read back (the read-only view)", () => {
  const targets = { paperTargets: 6, steelTargets: 3, noShootTargets: 2, hitsPerPaperTarget: 2 as const };

  it("shows the same summary as the draft it was saved from", () => {
    const saved = buildStageScore({
      draft: mockUp,
      matchId: "m",
      stageId: "st",
      shooterId: "sh",
      roId: "ro",
      now: "t",
      existing: null,
    });
    expect(summarizeDraft(draftFromScore(saved, targets), stage)).toEqual(summarizeDraft(mockUp, stage));
  });

  it("keeps penalties and the exact time", () => {
    const draft: ScoreDraft = { ...mockUp, timeDigits: "2307", noShoots: 2, procedurals: 1 };
    const saved = buildStageScore({
      draft,
      matchId: "m",
      stageId: "st",
      shooterId: "sh",
      roId: "ro",
      now: "t",
      existing: null,
    });
    const read = summarizeDraft(draftFromScore(saved, targets), stage);
    expect(read.seconds).toBe(23.07);
    expect(read.totals).toMatchObject({ NS: 2, PE: 1 });
    expect(read).toEqual(summarizeDraft(draft, stage));
  });
});

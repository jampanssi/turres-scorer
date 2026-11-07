import { scoreId } from "./ids";
import type { DnfStageScore, DqStageScore, ScoredStageScore } from "./types";

/**
 * Builders for valid saved results, for tests only (nothing in the app imports this file).
 * Pass the stage and shooter, and override only what the test is about.
 */

type Who = { stageId: string; shooterId: string };

const STAMP = "2026-11-07T10:00:00.000Z";

const base = ({ stageId, shooterId }: Who) => ({
  id: scoreId(stageId, shooterId),
  matchId: "m",
  stageId,
  shooterId,
  roId: "ro",
  createdAt: STAMP,
  updatedAt: STAMP,
});

/** A scored result: 10 s, one paper target with AA and one steel A (15 points, HF 1.5). */
export function scoredResult(over: Who & Partial<ScoredStageScore>): ScoredStageScore {
  return {
    ...base(over),
    status: "scored",
    timeSec: 10,
    paper: [["A", "A"]],
    steel: ["A"],
    noShoots: 0,
    procedurals: 0,
    shooterAccepted: true,
    ...over,
  };
}

export function dnfResult(over: Who & Partial<DnfStageScore>): DnfStageScore {
  return { ...base(over), status: "dnf", dnfReason: "injury", ...over };
}

export function dqResult(over: Who & Partial<DqStageScore>): DqStageScore {
  return { ...base(over), status: "dq", dqReason: "unsafe_handling", ...over };
}

import { secondsFromDigits, type ScoreDraft } from "./draft";
import { paperRemaining, steelRemaining } from "./entry";
import { codePoints, hitFactor, pointsOf, totalsOf, type Totals } from "@/shared/domain/scoring";
import type { ScoredStageScore, Stage, StageScore } from "@/shared/domain/types";
import { scoreId } from "@/shared/domain/ids";

/** What the Review sheet shows, and whether the draft is complete enough to save. */
export interface ReviewSummary {
  /** The time in seconds, or null if none was entered. */
  seconds: number | null;
  totals: Totals;
  /** Points per code (A: 55, M: -10 ...), as shown on the hit total tiles. */
  codePoints: Totals;
  /** Stage points (never negative) and hit factor. */
  points: number;
  hitFactor: number;
  missingTime: boolean;
  /** Paper and steel targets that do not have all their hits yet. */
  incompleteTargets: number;
  /** A time and every target complete: only then can the score be saved. */
  complete: boolean;
}

export function summarizeDraft(draft: ScoreDraft, stage: Pick<Stage, "hitsPerPaperTarget">): ReviewSummary {
  const seconds = secondsFromDigits(draft.timeDigits);
  const totals = totalsOf(draft);
  const points = pointsOf(totals);
  const incompleteTargets =
    draft.paper.filter((hits) => paperRemaining(hits, stage.hitsPerPaperTarget) > 0).length +
    draft.steel.filter((hit) => steelRemaining(hit) > 0).length;
  const missingTime = seconds === null || seconds <= 0;

  return {
    seconds,
    totals,
    codePoints: codePoints(totals),
    points,
    hitFactor: hitFactor(points, seconds),
    missingTime,
    incompleteTargets,
    complete: !missingTime && incompleteTargets === 0,
  };
}

interface BuildScoreInput {
  draft: ScoreDraft;
  matchId: string;
  stageId: string;
  shooterId: string;
  /** Who entered the score (the signed-in range officer). */
  roId: string;
  /** ISO timestamp for updatedAt (and createdAt on a new score). */
  now: string;
  /** The score being corrected, if any: keeps its createdAt. */
  existing: StageScore | null;
}

/** The result to save when the shooter has accepted the reviewed score. */
export function buildStageScore({
  draft,
  matchId,
  stageId,
  shooterId,
  roId,
  now,
  existing,
}: BuildScoreInput): ScoredStageScore {
  const timeSec = secondsFromDigits(draft.timeDigits);
  if (timeSec === null || timeSec <= 0) throw new Error("Cannot build a score without a time");

  return {
    id: scoreId(stageId, shooterId),
    matchId,
    stageId,
    shooterId,
    roId,
    status: "scored",
    timeSec,
    paper: draft.paper.map((hits) => [...hits]),
    steel: [...draft.steel],
    noShoots: draft.noShoots,
    procedurals: draft.procedurals,
    shooterAccepted: true,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

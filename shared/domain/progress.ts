import { dnsShooterIds } from "./attendance";
import { disqualifiedShooterIds } from "./disqualified";
import { scoreId } from "./ids";
import type { Attendance, StageScore } from "./types";

/**
 * Progress of stages, squads and matches. This is the ONE place that decides who counts:
 *
 * - A shooter is **expected** on a stage unless they are disqualified from the match (a DQ removes
 *   them from the rest of it) or are not starting (DNS at roll call). Such a shooter still counts on
 *   stages where they have a result: the stage of the DQ itself counts as scored, and so do stages
 *   they had already shot. A DNS can be reversed (roll call again), which makes them expected again.
 * - A **result** is any saved result: scored, DNF or DQ.
 * - A stage is **done** when every expected shooter has a result.
 *
 * Pure functions over a `ResultIndex` built once from the saved results of a match.
 */

/** A fast lookup over the saved results of one match. */
export interface ResultIndex {
  /** Shooters disqualified from the match. */
  disqualified: ReadonlySet<string>;
  /** Shooters whose latest roll call says DNS (did not show). */
  notStarting: ReadonlySet<string>;
  /** Does this shooter have a saved result on this stage? */
  has(stageId: string, shooterId: string): boolean;
}

/** Build the index from result ids (see `scoreId`), the ids of disqualified shooters and of DNS shooters. */
export function createResultIndex(
  resultIds: Iterable<string>,
  disqualified: Iterable<string> = [],
  notStarting: Iterable<string> = [],
): ResultIndex {
  const ids = new Set(resultIds);
  return {
    disqualified: new Set(disqualified),
    notStarting: new Set(notStarting),
    has: (stageId, shooterId) => ids.has(scoreId(stageId, shooterId)),
  };
}

/** Build the index from the saved results and the roll call records of a match. */
export function indexResults(results: readonly StageScore[], attendance: readonly Attendance[] = []): ResultIndex {
  return createResultIndex(
    results.map((r) => scoreId(r.stageId, r.shooterId)),
    disqualifiedShooterIds([...results]),
    dnsShooterIds(attendance),
  );
}

/** The shooters expected on a stage: everyone still starting, plus anyone out of the match with a result there. */
export function expectedShooters(stageId: string, shooterIds: readonly string[], index: ResultIndex): string[] {
  return shooterIds.filter(
    (id) => (!index.disqualified.has(id) && !index.notStarting.has(id)) || index.has(stageId, id),
  );
}

export type StageStatus = "done" | "inProgress" | "notStarted";

export interface StageProgress {
  /** Expected shooters with a result on this stage. */
  scored: number;
  /** Expected shooters. */
  total: number;
  status: StageStatus;
}

/** One stage for a group of shooters (a squad). */
export function stageProgress(stageId: string, shooterIds: readonly string[], index: ResultIndex): StageProgress {
  const expected = expectedShooters(stageId, shooterIds, index);
  const scored = expected.filter((id) => index.has(stageId, id)).length;
  const total = expected.length;
  const status: StageStatus = total > 0 && scored === total ? "done" : scored > 0 ? "inProgress" : "notStarted";
  return { scored, total, status };
}

export type SquadStatus = "done" | "onRange" | "notStarted";

export interface SquadProgress {
  stagesDone: number;
  stagesTotal: number;
  /** The first stage, in the order given, that is not done yet; null when all are done. */
  currentStageId: string | null;
  /** done = every stage done; onRange = some result saved; notStarted = none. */
  status: SquadStatus;
}

/** A squad over its stages, in the squad's rotation order. */
export function squadProgress(
  shooterIds: readonly string[],
  stageIds: readonly string[],
  index: ResultIndex,
): SquadProgress {
  const stages = stageIds.map((id) => ({ id, progress: stageProgress(id, shooterIds, index) }));
  const stagesDone = stages.filter((s) => s.progress.status === "done").length;
  const anyResult = stages.some((s) => s.progress.scored > 0);
  const allDone = stages.length > 0 && stagesDone === stages.length;

  return {
    stagesDone,
    stagesTotal: stages.length,
    currentStageId: stages.find((s) => s.progress.status !== "done")?.id ?? null,
    status: allDone ? "done" : anyResult ? "onRange" : "notStarted",
  };
}

export interface MatchProgress {
  /** Results of expected shooters. */
  scored: number;
  /** Every expected shooter on every stage (after a DQ, the later stages drop out). */
  total: number;
}

/** A whole match: every squad on every stage. */
export function matchProgress(
  squads: ReadonlyArray<{ shooterIds: readonly string[] }>,
  stageIds: readonly string[],
  index: ResultIndex,
): MatchProgress {
  let scored = 0;
  let total = 0;
  for (const squad of squads) {
    for (const stageId of stageIds) {
      const progress = stageProgress(stageId, squad.shooterIds, index);
      scored += progress.scored;
      total += progress.total;
    }
  }
  return { scored, total };
}

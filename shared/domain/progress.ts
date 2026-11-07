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

/** One stage for a group of shooters (a squad): the squad cards of a stage. */
export function stageProgress(stageId: string, shooterIds: readonly string[], index: ResultIndex): StageProgress {
  const expected = expectedShooters(stageId, shooterIds, index);
  const scored = expected.filter((id) => index.has(stageId, id)).length;
  const total = expected.length;
  const status: StageStatus = total > 0 && scored === total ? "done" : scored > 0 ? "inProgress" : "notStarted";
  return { scored, total, status };
}

export interface StageAcrossSquads extends StageProgress {
  /** Squads whose expected shooters all have a result on this stage. */
  squadsDone: number;
}

/**
 * One stage for several squads (the match view's stage list): the sums of `stageProgress` over the
 * squads. Done when every expected shooter of every squad has a result, in progress when some do.
 */
export function stageProgressAcross(
  stageId: string,
  squads: ReadonlyArray<{ shooterIds: readonly string[] }>,
  index: ResultIndex,
): StageAcrossSquads {
  const perSquad = squads.map((squad) => stageProgress(stageId, squad.shooterIds, index));
  const scored = perSquad.reduce((n, p) => n + p.scored, 0);
  const total = perSquad.reduce((n, p) => n + p.total, 0);
  const status: StageStatus = total > 0 && scored === total ? "done" : scored > 0 ? "inProgress" : "notStarted";
  return { scored, total, status, squadsDone: perSquad.filter((p) => p.status === "done").length };
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

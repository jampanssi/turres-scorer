import { hitFactor, pointsOf, totalsOf } from "@/features/scoring/rules";
import type { Repository } from "@/shared/data/repository";
import { disqualifiedShooterIds } from "@/shared/domain/disqualified";
import type { Shooter, Squad, Stage, StageScore } from "@/shared/domain/types";

/**
 * Row state on the Shooters screen:
 * - scored / dnf: a result is saved on this stage
 * - dq: disqualified from the match (any stage); listed last and not selectable
 * - shooting: the first active shooter in the order without a result
 * - onDeck: the next one without a result
 * - waiting: everyone after that
 */
export type ShooterRowState = "scored" | "dnf" | "dq" | "shooting" | "onDeck" | "waiting";

export interface ShooterRowData {
  /** 1-based shooting order among the shooters still in the match; null for disqualified shooters. */
  order: number | null;
  shooter: Shooter;
  state: ShooterRowState;
  /** Hit factor, only for scored results. */
  hitFactor: number | null;
}

/**
 * Rows in shooting order, with disqualified shooters moved to the end (keeping their relative order).
 * `scores` are the saved results of this stage; `disqualified` holds shooters disqualified in the match.
 */
export function buildShooterRows(
  shooters: Shooter[],
  scores: StageScore[],
  disqualified: Set<string> = new Set(),
): ShooterRowData[] {
  const byShooter = new Map(scores.map((s) => [s.shooterId, s]));
  const isDisqualified = (shooter: Shooter) =>
    disqualified.has(shooter.id) || byShooter.get(shooter.id)?.status === "dq";

  const active = shooters.filter((s) => !isDisqualified(s));
  const removed = shooters.filter(isDisqualified);

  let waitingSeen = 0; // active shooters without a result so far: 0 -> next is shooting, 1 -> on deck
  const activeRows = active.map((shooter, index): ShooterRowData => {
    const base = { order: index + 1, shooter };
    const result = byShooter.get(shooter.id);

    if (result) {
      if (result.status === "dnf") return { ...base, state: "dnf", hitFactor: null };
      return {
        ...base,
        state: "scored",
        hitFactor: hitFactor(pointsOf(totalsOf(result)), result.timeSec),
      };
    }

    const state: ShooterRowState = waitingSeen === 0 ? "shooting" : waitingSeen === 1 ? "onDeck" : "waiting";
    waitingSeen += 1;
    return { ...base, state, hitFactor: null };
  });

  const removedRows = removed.map(
    (shooter): ShooterRowData => ({ order: null, shooter, state: "dq", hitFactor: null }),
  );
  return [...activeRows, ...removedRows];
}

export interface ShootersOverview {
  squad: Squad;
  stage: Stage;
  rows: ShooterRowData[];
  /** Expected shooters with a saved result on this stage (scored, DNF or DQ). */
  scoredCount: number;
  /**
   * Shooters expected on this stage: everyone still in the match, plus a disqualified shooter on a
   * stage where they have a result (a DQ counts as scored on its own stage). Later stages do not expect them.
   */
  totalCount: number;
}

/** Everything the Shooters screen needs, or null if the squad or stage is not part of the match. */
export async function loadShootersOverview(
  repo: Repository,
  matchId: string,
  squadId: string,
  stageId: string,
): Promise<ShootersOverview | null> {
  const [squad, stage] = await Promise.all([repo.getSquad(squadId), repo.getStage(stageId)]);
  if (!squad || !stage || squad.matchId !== matchId || stage.matchId !== matchId) return null;

  const [shooters, matchScores] = await Promise.all([repo.listShooters(squadId), repo.listScores(matchId)]);
  const stageScores = matchScores.filter((s) => s.stageId === stageId);
  const disqualified = disqualifiedShooterIds(matchScores);
  const rows = buildShooterRows(shooters, stageScores, disqualified);

  const hasResult = new Set(stageScores.map((s) => s.shooterId));
  const expected = shooters.filter((s) => !disqualified.has(s.id) || hasResult.has(s.id));
  return {
    squad,
    stage,
    rows,
    scoredCount: expected.filter((s) => hasResult.has(s.id)).length,
    totalCount: expected.length,
  };
}

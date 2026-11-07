import type { Repository } from "@/shared/data/repository";
import { isCompleted } from "@/shared/domain/match-state";
import { indexResults } from "@/shared/domain/progress";
import type { Shooter, Squad, Stage, StageScore } from "@/shared/domain/types";

export interface ScoringContext {
  squad: Squad;
  stage: Stage;
  shooter: Shooter;
  /** The saved result of this shooter on this stage, if any (opened again to correct it). */
  existing: StageScore | null;
  /** Disqualified from the match: the screen must not allow entering a score. */
  disqualified: boolean;
  /** DNS at roll call and no result yet: the screen must not allow entering a score. */
  notStarting: boolean;
  /** The match is completed: everything is read only, with no Edit button and no entry form. */
  matchCompleted: boolean;
  /** The next shooter in the squad without a result on this stage (not this one, not disqualified), or null. */
  nextShooterId: string | null;
}

/**
 * Everything the Scoring screen needs, or null if the squad, stage or shooter do not belong
 * together in this match.
 */
export async function loadScoringContext(
  repo: Repository,
  matchId: string,
  squadId: string,
  stageId: string,
  shooterId: string,
): Promise<ScoringContext | null> {
  const [squad, stage, shooter, match] = await Promise.all([
    repo.getSquad(squadId),
    repo.getStage(stageId),
    repo.getShooter(shooterId),
    repo.getMatch(matchId),
  ]);
  if (!squad || !stage || !shooter || !match) return null;
  if (squad.matchId !== matchId || stage.matchId !== matchId || !squad.shooterIds.includes(shooterId)) return null;

  const [existing, matchScores, squadShooters, attendance] = await Promise.all([
    repo.getScore(stageId, shooterId),
    repo.listScores(matchId),
    repo.listShooters(squadId),
    repo.listAttendance(matchId),
  ]);
  const index = indexResults(matchScores, attendance);
  const scoredHere = new Set(matchScores.filter((s) => s.stageId === stageId).map((s) => s.shooterId));
  const next = squadShooters.find(
    (s) => s.id !== shooterId && !scoredHere.has(s.id) && !index.disqualified.has(s.id) && !index.notStarting.has(s.id),
  );
  return {
    squad,
    stage,
    shooter,
    existing,
    disqualified: index.disqualified.has(shooterId),
    notStarting: index.notStarting.has(shooterId) && existing === null,
    matchCompleted: isCompleted(match),
    nextShooterId: next?.id ?? null,
  };
}

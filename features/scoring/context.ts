import type { Repository } from "@/shared/data/repository";
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
  const [squad, stage, shooter] = await Promise.all([
    repo.getSquad(squadId),
    repo.getStage(stageId),
    repo.getShooter(shooterId),
  ]);
  if (!squad || !stage || !shooter) return null;
  if (squad.matchId !== matchId || stage.matchId !== matchId || !squad.shooterIds.includes(shooterId)) return null;

  const [existing, matchScores, squadShooters] = await Promise.all([
    repo.getScore(stageId, shooterId),
    repo.listScores(matchId),
    repo.listShooters(squadId),
  ]);
  const index = indexResults(matchScores);
  const scoredHere = new Set(matchScores.filter((s) => s.stageId === stageId).map((s) => s.shooterId));
  const next = squadShooters.find((s) => s.id !== shooterId && !scoredHere.has(s.id) && !index.disqualified.has(s.id));
  return {
    squad,
    stage,
    shooter,
    existing,
    disqualified: index.disqualified.has(shooterId),
    nextShooterId: next?.id ?? null,
  };
}

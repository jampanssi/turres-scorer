import type { Repository } from "@/shared/data/repository";
import { indexResults, type ResultIndex, squadProgress, type SquadStatus } from "@/shared/domain/progress";
import type { Match, Squad, Stage } from "@/shared/domain/types";

export type { SquadStatus } from "@/shared/domain/progress";

export interface SquadSummary {
  squad: Squad;
  shooters: number;
  stagesTotal: number;
  /** Stages where every expected shooter has a saved result. */
  stagesDone: number;
  /** The squad's next unfinished stage in rotation order; null when all are done. */
  currentStage: Stage | null;
  status: SquadStatus;
}

/**
 * Progress of one squad over its rotation. Who is expected, and when a stage or squad is done, is
 * decided in `shared/domain/progress.ts`.
 */
export function summarizeSquad(squad: Squad, stages: Map<string, Stage>, index: ResultIndex): SquadSummary {
  const rotation = squad.stageRotation.map((id) => stages.get(id)).filter((s): s is Stage => s !== undefined);
  const progress = squadProgress(
    squad.shooterIds,
    rotation.map((stage) => stage.id),
    index,
  );

  return {
    squad,
    shooters: squad.shooterIds.length,
    stagesTotal: progress.stagesTotal,
    stagesDone: progress.stagesDone,
    currentStage: progress.currentStageId ? (stages.get(progress.currentStageId) ?? null) : null,
    status: progress.status,
  };
}

export interface SquadsOverview {
  match: Match;
  stageCount: number;
  shooterCount: number;
  squads: SquadSummary[];
}

/** Everything the Squads screen needs, or null if the match does not exist. */
export async function loadSquadsOverview(repo: Repository, matchId: string): Promise<SquadsOverview | null> {
  const match = await repo.getMatch(matchId);
  if (!match) return null;

  const [stageList, squadList, scores] = await Promise.all([
    repo.listStages(matchId),
    repo.listSquads(matchId),
    repo.listScores(matchId),
  ]);
  const stages = new Map(stageList.map((s) => [s.id, s]));
  const index = indexResults(scores);
  const squads = squadList.map((squad) => summarizeSquad(squad, stages, index));

  return {
    match,
    stageCount: stageList.length,
    shooterCount: squads.reduce((sum, s) => sum + s.shooters, 0),
    squads,
  };
}

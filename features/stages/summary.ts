import type { Repository } from "@/shared/data/repository";
import { indexResults, type ResultIndex, stageProgressAcross, type StageStatus } from "@/shared/domain/progress";
import type { Match, Squad, Stage } from "@/shared/domain/types";

export type { StageStatus } from "@/shared/domain/progress";

export interface StageSummary {
  stage: Stage;
  /** Expected shooters, over all squads, with a saved result on this stage (scored, DNF or DQ). */
  scored: number;
  total: number;
  status: StageStatus;
  /** Squads whose shooters all have a result on this stage. */
  squadsDone: number;
}

/**
 * Progress of one stage over every squad. Who is expected, and when a stage is done, is decided in
 * `shared/domain/progress.ts` (a DQ'd or DNS shooter counts only on stages where they have a result).
 */
export function summarizeStage(stage: Stage, squads: readonly Squad[], index: ResultIndex): StageSummary {
  return { stage, ...stageProgressAcross(stage.id, squads, index) };
}

export interface StagesOverview {
  match: Match;
  squadCount: number;
  shooterCount: number;
  stages: StageSummary[];
  stagesDone: number;
}

/** Everything the Stages screen (the match view) needs, or null if the match does not exist. */
export async function loadStagesOverview(repo: Repository, matchId: string): Promise<StagesOverview | null> {
  const match = await repo.getMatch(matchId);
  if (!match) return null;

  const [stageList, squadList, scores, attendance] = await Promise.all([
    repo.listStages(matchId),
    repo.listSquads(matchId),
    repo.listScores(matchId),
    repo.listAttendance(matchId),
  ]);
  const index = indexResults(scores, attendance);
  const stages = stageList.map((stage) => summarizeStage(stage, squadList, index));

  return {
    match,
    squadCount: squadList.length,
    shooterCount: squadList.reduce((n, s) => n + s.shooterIds.length, 0),
    stages,
    stagesDone: stages.filter((s) => s.status === "done").length,
  };
}

import type { Repository } from "@/shared/data/repository";
import { indexResults, type ResultIndex, stageProgress, type StageStatus } from "@/shared/domain/progress";
import type { Squad, Stage } from "@/shared/domain/types";

export type { StageStatus } from "@/shared/domain/progress";

export interface StageSummary {
  stage: Stage;
  /** Expected shooters with a saved result on this stage (scored, DNF or DQ). */
  scored: number;
  total: number;
  status: StageStatus;
}

/**
 * Progress of one stage for one squad. Who is expected, and when a stage is done, is decided in
 * `shared/domain/progress.ts` (a DQ'd shooter counts only on stages where they have a result).
 */
export function summarizeStage(stage: Stage, squad: Squad, index: ResultIndex): StageSummary {
  return { stage, ...stageProgress(stage.id, squad.shooterIds, index) };
}

export interface StagesOverview {
  squad: Squad;
  stages: StageSummary[];
  stagesDone: number;
}

/** Everything the Stage selection screen needs, or null if the squad does not exist in that match. */
export async function loadStagesOverview(
  repo: Repository,
  matchId: string,
  squadId: string,
): Promise<StagesOverview | null> {
  const squad = await repo.getSquad(squadId);
  if (!squad || squad.matchId !== matchId) return null;

  const [stageList, scores, attendance] = await Promise.all([
    repo.listStages(matchId),
    repo.listScores(matchId),
    repo.listAttendance(matchId),
  ]);
  const index = indexResults(scores, attendance);
  const stages = stageList.map((stage) => summarizeStage(stage, squad, index));
  const stagesDone = stages.filter((s) => s.status === "done").length;

  return { squad, stages, stagesDone };
}

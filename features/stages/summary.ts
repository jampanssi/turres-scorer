import type { Repository } from "@/shared/data/repository";
import type { Squad, Stage } from "@/shared/domain/types";

export type StageStatus = "done" | "inProgress" | "notStarted";

export interface StageSummary {
  stage: Stage;
  /** Shooters of the squad with a saved result on this stage (scored, DNF or DQ). */
  scored: number;
  total: number;
  status: StageStatus;
}

/**
 * Progress of one stage for one squad: done = every shooter has a result, inProgress = some,
 * notStarted = none. `scoredKeys` holds `${stageId}:${shooterId}` keys of saved results.
 */
export function summarizeStage(stage: Stage, squad: Squad, scoredKeys: Set<string>): StageSummary {
  const total = squad.shooterIds.length;
  const scored = squad.shooterIds.filter((id) => scoredKeys.has(`${stage.id}:${id}`)).length;
  const status: StageStatus = total > 0 && scored === total ? "done" : scored > 0 ? "inProgress" : "notStarted";
  return { stage, scored, total, status };
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

  const [stageList, scores] = await Promise.all([repo.listStages(matchId), repo.listScores(matchId)]);
  const scoredKeys = new Set(scores.map((s) => `${s.stageId}:${s.shooterId}`));
  const stages = stageList.map((stage) => summarizeStage(stage, squad, scoredKeys));

  return { squad, stages, stagesDone: stages.filter((s) => s.status === "done").length };
}

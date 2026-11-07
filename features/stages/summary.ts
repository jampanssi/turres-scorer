import type { Repository } from "@/shared/data/repository";
import { disqualifiedShooterIds } from "@/shared/domain/disqualified";
import type { Squad, Stage } from "@/shared/domain/types";

export type StageStatus = "done" | "inProgress" | "notStarted";

export interface StageSummary {
  stage: Stage;
  /** Expected shooters with a saved result on this stage (scored, DNF or DQ). */
  scored: number;
  total: number;
  status: StageStatus;
}

/**
 * Progress of one stage for one squad: done = every shooter has a result, inProgress = some,
 * notStarted = none. `scoredKeys` holds `${stageId}:${shooterId}` keys of saved results.
 * A shooter disqualified from the match is only counted on stages where they have a result (the stage
 * of the DQ itself counts as scored); on later stages they are out of the match and not waited for.
 */
export function summarizeStage(
  stage: Stage,
  squad: Squad,
  scoredKeys: Set<string>,
  disqualified: Set<string> = new Set(),
): StageSummary {
  const hasResult = (id: string) => scoredKeys.has(`${stage.id}:${id}`);
  const expected = squad.shooterIds.filter((id) => !disqualified.has(id) || hasResult(id));
  const total = expected.length;
  const scored = expected.filter(hasResult).length;
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
  const disqualified = disqualifiedShooterIds(scores);
  const stages = stageList.map((stage) => summarizeStage(stage, squad, scoredKeys, disqualified));

  return { squad, stages, stagesDone: stages.filter((s) => s.status === "done").length };
}

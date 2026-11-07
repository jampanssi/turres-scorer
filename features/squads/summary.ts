import type { Repository } from "@/shared/data/repository";
import { disqualifiedShooterIds } from "@/shared/domain/disqualified";
import type { Match, Squad, Stage } from "@/shared/domain/types";

export type SquadStatus = "done" | "onRange" | "notStarted";

export interface SquadSummary {
  squad: Squad;
  shooters: number;
  stagesTotal: number;
  /** Stages where every shooter still in the match has a saved result. */
  stagesDone: number;
  /** The squad's next unfinished stage in rotation order; null when all are done. */
  currentStage: Stage | null;
  status: SquadStatus;
}

/**
 * Progress of one squad. A stage is done when every shooter still in the match has a saved result
 * (scored or DNF); shooters disqualified from the match are not waited for.
 * Status: done = every stage done; onRange = some result saved; notStarted = none.
 * `scored` holds `${stageId}:${shooterId}` keys of saved results.
 */
export function summarizeSquad(
  squad: Squad,
  stages: Map<string, Stage>,
  scored: Set<string>,
  disqualified: Set<string> = new Set(),
): SquadSummary {
  const active = squad.shooterIds.filter((id) => !disqualified.has(id));
  const rotation = squad.stageRotation.map((id) => stages.get(id)).filter((s): s is Stage => s !== undefined);
  const hasResult = (stageId: string, shooterId: string) => scored.has(`${stageId}:${shooterId}`);

  const isDone = (stage: Stage) => active.length > 0 && active.every((shooterId) => hasResult(stage.id, shooterId));

  const stagesDone = rotation.filter(isDone).length;
  const anyResult = rotation.some((stage) => squad.shooterIds.some((id) => hasResult(stage.id, id)));
  const allDone = rotation.length > 0 && stagesDone === rotation.length;

  return {
    squad,
    shooters: squad.shooterIds.length,
    stagesTotal: rotation.length,
    stagesDone,
    currentStage: rotation.find((stage) => !isDone(stage)) ?? null,
    status: allDone ? "done" : anyResult ? "onRange" : "notStarted",
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
  const scored = new Set(scores.map((s) => `${s.stageId}:${s.shooterId}`));
  const disqualified = disqualifiedShooterIds(scores);
  const squads = squadList.map((squad) => summarizeSquad(squad, stages, scored, disqualified));

  return {
    match,
    stageCount: stageList.length,
    shooterCount: squads.reduce((sum, s) => sum + s.shooters, 0),
    squads,
  };
}

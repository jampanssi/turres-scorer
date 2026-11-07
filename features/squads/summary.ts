import type { Repository } from "@/shared/data/repository";
import { indexResults, type ResultIndex, stageProgress, type StageStatus } from "@/shared/domain/progress";
import type { Squad, Stage } from "@/shared/domain/types";

export type { StageStatus } from "@/shared/domain/progress";

export interface SquadSummary {
  squad: Squad;
  shooters: number;
  /** Expected shooters of this squad with a saved result on the stage (scored, DNF or DQ). */
  scored: number;
  total: number;
  status: StageStatus;
}

/**
 * One squad on one stage. Who is expected, and when it is done, is decided in
 * `shared/domain/progress.ts`; `shooters` is everyone on the squad's list, `total` who is still expected.
 */
export function summarizeSquad(squad: Squad, stage: Stage, index: ResultIndex): SquadSummary {
  return { squad, shooters: squad.shooterIds.length, ...stageProgress(stage.id, squad.shooterIds, index) };
}

export interface SquadsOverview {
  stage: Stage;
  /** Every squad of the match, in squad number order. */
  squads: SquadSummary[];
  squadsDone: number;
}

/** Everything the Squads screen (the squads of one stage) needs, or null if the stage is not in the match. */
export async function loadSquadsOverview(
  repo: Repository,
  matchId: string,
  stageId: string,
): Promise<SquadsOverview | null> {
  const stage = await repo.getStage(stageId);
  if (!stage || stage.matchId !== matchId) return null;

  const [squadList, scores, attendance] = await Promise.all([
    repo.listSquads(matchId),
    repo.listScores(matchId),
    repo.listAttendance(matchId),
  ]);
  const index = indexResults(scores, attendance);
  const squads = squadList.map((squad) => summarizeSquad(squad, stage, index));

  return { stage, squads, squadsDone: squads.filter((s) => s.status === "done").length };
}

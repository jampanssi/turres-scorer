import type { Repository } from "@/shared/data/repository";
import { indexResults, matchProgress } from "@/shared/domain/progress";
import type { Match } from "@/shared/domain/types";

export type MatchTab = "open" | "results";

export interface MatchSummary {
  match: Match;
  stages: number;
  squads: number;
  shooters: number;
  /** Saved results (scored, DNF or DQ). */
  scored: number;
  /** Every shooter on every stage they are still expected on (after a DQ, the later stages drop out). */
  totalScores: number;
}

export async function loadMatchSummaries(repo: Repository): Promise<MatchSummary[]> {
  const matches = await repo.listMatches();
  return Promise.all(
    matches.map(async (match) => {
      const [stages, squads, scores] = await Promise.all([
        repo.listStages(match.id),
        repo.listSquads(match.id),
        repo.listScores(match.id),
      ]);
      const shooters = squads.reduce((sum, squad) => sum + squad.shooterIds.length, 0);
      // Who counts (incl. a disqualified shooter) is decided in shared/domain/progress.ts.
      const progress = matchProgress(
        squads,
        stages.map((stage) => stage.id),
        indexResults(scores),
      );
      return {
        match,
        stages: stages.length,
        squads: squads.length,
        shooters,
        scored: progress.scored,
        totalScores: progress.total,
      };
    }),
  );
}

/**
 * Open tab: live and upcoming matches, live first, then by date. Results tab: finished
 * matches, newest first.
 */
export function summariesForTab(summaries: MatchSummary[], tab: MatchTab): MatchSummary[] {
  if (tab === "results") {
    return summaries
      .filter((s) => s.match.status === "finished")
      .sort((a, b) => b.match.date.localeCompare(a.match.date));
  }
  const rank = (s: MatchSummary) => (s.match.status === "live" ? 0 : 1);
  return summaries
    .filter((s) => s.match.status !== "finished")
    .sort((a, b) => rank(a) - rank(b) || a.match.date.localeCompare(b.match.date));
}

import type { StageStatus } from "./progress";
import type { Match, ResultsVisibility } from "./types";

/**
 * Match completion rules. Pure functions, no React.
 *
 * A match is **completed** when its status is "finished": scoring, DNS marks and every other change
 * are locked (the repository refuses them), and the match is listed under Results. Completing is
 * final in the app. The chosen results visibility is stored on the match for a results view and the
 * export; until the organiser's system supplies one, a finished match counts as "participants".
 */

export const DEFAULT_RESULTS_VISIBILITY: ResultsVisibility = "participants";

export function isCompleted(match: Pick<Match, "status">): boolean {
  return match.status === "finished";
}

/** The visibility that applies to a match: the stored choice, or the default. */
export function visibilityOf(match: Pick<Match, "resultsVisibility">): ResultsVisibility {
  return match.resultsVisibility ?? DEFAULT_RESULTS_VISIBILITY;
}

/**
 * A match can be completed once **every stage is done** (every expected shooter of every squad has a
 * result). A stage nobody is expected on (everyone DNS or disqualified) has nothing left to do, so it
 * does not hold the match up; a match with no stages cannot be completed.
 */
export function canCompleteMatch(stages: ReadonlyArray<{ status: StageStatus; total: number }>): boolean {
  return stages.length > 0 && stages.every((stage) => stage.status === "done" || stage.total === 0);
}

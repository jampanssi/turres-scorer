import type { StageScore } from "@/shared/domain/types";

/**
 * A DQ removes the shooter from the rest of the match (see DESIGN.md, Confirm DQ), so a
 * shooter is disqualified if ANY of their saved results in the match has status "dq".
 * Pass the scores of the whole match.
 */
export function disqualifiedShooterIds(scores: StageScore[]): Set<string> {
  return new Set(scores.filter((s) => s.status === "dq").map((s) => s.shooterId));
}

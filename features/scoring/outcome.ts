import { scoreId } from "@/shared/domain/ids";
import type { DnfReason, DnfStageScore, DqReason, DqStageScore, StageScore } from "@/shared/domain/types";

interface BuildDnfInput {
  matchId: string;
  stageId: string;
  shooterId: string;
  /** Who entered the result (the signed-in range officer). */
  roId: string;
  reason: DnfReason;
  /** ISO timestamp for updatedAt (and createdAt on a new result). */
  now: string;
  /** The result being replaced, if any: keeps its createdAt. */
  existing: StageScore | null;
}

/**
 * A DNF (did not finish) for one stage. The result has no time and no hits: whatever was entered or
 * saved on this stage before is replaced and discarded.
 */
export function buildDnfScore({
  matchId,
  stageId,
  shooterId,
  roId,
  reason,
  now,
  existing,
}: BuildDnfInput): DnfStageScore {
  return {
    id: scoreId(stageId, shooterId),
    matchId,
    stageId,
    shooterId,
    roId,
    status: "dnf",
    dnfReason: reason,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

interface BuildDqInput {
  matchId: string;
  stageId: string;
  shooterId: string;
  /** Who entered the result (the signed-in range officer). */
  roId: string;
  reason: DqReason;
  /** Optional free text; trimmed, and left out when empty. */
  note?: string;
  /** ISO timestamp for updatedAt (and createdAt on a new result). */
  now: string;
  /** The result being replaced, if any: keeps its createdAt. */
  existing: StageScore | null;
}

/**
 * A disqualification, recorded on the stage where it happens. Like a DNF it has no time or hits.
 * A DQ removes the shooter from the rest of the match: see shared/domain/progress.ts, which the
 * lists use to show them last and unselectable.
 */
export function buildDqScore({
  matchId,
  stageId,
  shooterId,
  roId,
  reason,
  note,
  now,
  existing,
}: BuildDqInput): DqStageScore {
  const trimmed = note?.trim();
  return {
    id: scoreId(stageId, shooterId),
    matchId,
    stageId,
    shooterId,
    roId,
    status: "dq",
    dqReason: reason,
    ...(trimmed ? { note: trimmed } : {}),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

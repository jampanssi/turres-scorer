import { scoreId } from "@/shared/data/repository";
import type { DnfReason, DqReason, StageScore } from "@/shared/domain/types";

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
 * A DNF (did not finish) for one stage. It is a saved result with no time and no hits: whatever was
 * entered or saved on this stage before is discarded. There is no shooter sign-off for a DNF.
 */
export function buildDnfScore({ matchId, stageId, shooterId, roId, reason, now, existing }: BuildDnfInput): StageScore {
  return {
    id: scoreId(stageId, shooterId),
    matchId,
    stageId,
    shooterId,
    roId,
    status: "dnf",
    timeSec: null,
    paper: [],
    steel: [],
    noShoots: 0,
    procedurals: 0,
    dnfReason: reason,
    shooterAccepted: false,
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
 * A disqualification, recorded on the stage where it happens. Like a DNF it carries no time or hits
 * and has no shooter sign-off. A DQ removes the shooter from the rest of the match: see
 * `disqualifiedShooterIds` (shared/domain), which the lists use to show them last and unselectable.
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
}: BuildDqInput): StageScore {
  const trimmed = note?.trim();
  return {
    id: scoreId(stageId, shooterId),
    matchId,
    stageId,
    shooterId,
    roId,
    status: "dq",
    timeSec: null,
    paper: [],
    steel: [],
    noShoots: 0,
    procedurals: 0,
    dqReason: reason,
    ...(trimmed ? { note: trimmed } : {}),
    shooterAccepted: false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

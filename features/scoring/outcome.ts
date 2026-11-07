import { scoreId } from "@/shared/data/repository";
import type { DnfReason, StageScore } from "@/shared/domain/types";

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

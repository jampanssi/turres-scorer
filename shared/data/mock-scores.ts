import type { Catalog } from "./mock";
import { scoreId } from "./repository";
import type { HitCode, Squad, Stage, StageScore, SteelHit } from "@/shared/domain/types";

/**
 * Sample results for the live match so that Done / On range / In progress states are visible
 * without scoring by hand. Read-only seed data: real saves go to the ScoreStore and override it.
 * Replaced by SSI data later. Deterministic (no Math.random), so tests and screens are stable.
 */

interface SquadProgress {
  /** Stages fully scored, in the squad's rotation order. */
  stagesDone: number;
  /** Shooters already scored on the next stage (stage in progress). */
  partial?: number;
}

// Squad number -> progress, per match id. Roughly follows docs/design/3 · Squads.png.
const SEED_PROGRESS: Record<string, Record<number, SquadProgress>> = {
  "autumn-2026": {
    1: { stagesDone: 6 },
    2: { stagesDone: 2, partial: 3 },
    3: { stagesDone: 3, partial: 5 },
    4: { stagesDone: 6 },
    5: { stagesDone: 1 },
  },
};

// One shooter is marked DNF so that status is visible too: squad 1, its second stage, 4th shooter.
const DNF = { matchId: "autumn-2026", squad: 1, stageIndex: 1, shooterIndex: 3 };

/** Small seeded PRNG (mulberry32) so the same ids always give the same numbers. */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickHit(rand: () => number): HitCode {
  const r = rand();
  if (r < 0.6) return "A";
  if (r < 0.85) return "C";
  if (r < 0.95) return "D";
  return "M";
}

function makeScore(matchId: string, stage: Stage, shooterId: string, dnf: boolean): StageScore {
  const rand = seededRandom(`${stage.id}:${shooterId}`);
  const base = {
    id: scoreId(stage.id, shooterId),
    matchId,
    stageId: stage.id,
    shooterId,
    roId: "ro-1",
    shooterAccepted: true,
    createdAt: "2026-11-07T09:00:00.000Z",
    updatedAt: "2026-11-07T09:00:00.000Z",
  };

  if (dnf) {
    return {
      ...base,
      status: "dnf",
      timeSec: null,
      paper: [],
      steel: [],
      noShoots: 0,
      procedurals: 0,
      dnfReason: "equipment_failure",
      shooterAccepted: true,
    };
  }

  const paper: HitCode[][] = Array.from({ length: stage.paperTargets }, () => [pickHit(rand), pickHit(rand)]);
  const steel: SteelHit[] = Array.from({ length: stage.steelTargets }, () => (rand() < 0.85 ? "A" : "M"));
  const noShoots = stage.noShootTargets > 0 && rand() < 0.1 ? 1 : 0;
  const procedurals = rand() < 0.05 ? 1 : 0;
  const timeSec = Math.round((6 + rand() * 14) * 100) / 100;

  return { ...base, status: "scored", timeSec, paper, steel, noShoots, procedurals };
}

export function buildMockScores(catalog: Catalog): StageScore[] {
  const stages = new Map<string, Stage>(catalog.stages.map((s) => [s.id, s]));
  const scores: StageScore[] = [];

  for (const [matchId, bySquad] of Object.entries(SEED_PROGRESS)) {
    const squads: Squad[] = catalog.squads.filter((s) => s.matchId === matchId);
    for (const squad of squads) {
      const progress = bySquad[squad.number];
      if (!progress) continue;

      squad.stageRotation.forEach((stageId, stageIndex) => {
        const stage = stages.get(stageId)!;
        const shooterIds =
          stageIndex < progress.stagesDone
            ? squad.shooterIds
            : stageIndex === progress.stagesDone && progress.partial
              ? squad.shooterIds.slice(0, progress.partial)
              : [];
        shooterIds.forEach((shooterId, shooterIndex) => {
          const dnf =
            matchId === DNF.matchId &&
            squad.number === DNF.squad &&
            stageIndex === DNF.stageIndex &&
            shooterIndex === DNF.shooterIndex;
          scores.push(makeScore(matchId, stage, shooterId, dnf));
        });
      });
    }
  }
  return scores;
}

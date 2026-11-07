/** App-owned domain model. SSI data is mapped onto these types later (integrations/ssi). */

export type HitCode = "A" | "C" | "D" | "M";
export type SteelHit = "A" | "M" | null;

export interface Match {
  id: string;
  name: string;
  date: string; // ISO date
  range: string;
  status: "open" | "live" | "finished";
  stageIds: string[];
  squadIds: string[];
}

export interface Stage {
  id: string;
  matchId: string;
  number: number;
  name: string;
  minRounds: number;
  paperTargets: number;
  steelTargets: number;
  noShootTargets: number;
}

export interface Squad {
  id: string;
  matchId: string;
  number: number;
  shooterIds: string[]; // ordered = shooting order
  stageRotation: string[];
}

export interface Shooter {
  id: string;
  name: string;
  competitorNumber: number;
}

export interface StageScore {
  id: string;
  matchId: string;
  stageId: string;
  shooterId: string;
  roId: string;
  status: "scored" | "dnf" | "dq";
  timeSec: number | null;
  /** One array per paper target, length <= 2, order = tap order. */
  paper: HitCode[][];
  /** One entry per steel target. */
  steel: SteelHit[];
  noShoots: number;
  procedurals: number;
  dnfReason?: string;
  dqReason?: string;
  note?: string;
  shooterAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

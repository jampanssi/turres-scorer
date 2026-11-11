/** App-owned domain model. SSI data is mapped onto these types later (integrations/ssi). */

export type HitCode = "A" | "C" | "D" | "M";
export type SteelHit = "A" | "M" | null;

/** Reason codes (not display text) so a score reads correctly in any UI language. The lists are not final. */
export const DQ_REASONS = ["unsafe_handling", "accidental_discharge", "unsportsmanlike", "other"] as const;
export const DNF_REASONS = ["equipment_failure", "injury", "withdrew", "other"] as const;
export type DqReason = (typeof DQ_REASONS)[number];
export type DnfReason = (typeof DNF_REASONS)[number];

/** Who may see a completed match's results. Stored on the match; a results view and the export honour it. */
export const RESULTS_VISIBILITIES = ["public", "participants", "organisers"] as const;
export type ResultsVisibility = (typeof RESULTS_VISIBILITIES)[number];

/** What is chosen when a match is completed. It is final in the app: a completed match is read only. */
export interface MatchCompletion {
  matchId: string;
  visibility: ResultsVisibility;
  /** ISO timestamp from the repository clock. */
  completedAt: string;
  /** The range officer who completed it. */
  completedBy: string;
}

export interface Match {
  id: string;
  name: string;
  date: string; // ISO date
  range: string;
  /** "finished" once the match is completed (or, for sample data, from the start). */
  status: "open" | "live" | "finished";
  stageIds: string[];
  squadIds: string[];
  /** Set when the match is completed in the app. */
  resultsVisibility?: ResultsVisibility;
  completedAt?: string;
  completedBy?: string;
}

/** Scored hits a paper target needs on a stage: set per stage, usually 2 (some stages use 1 or 3). */
export type HitsPerPaperTarget = 1 | 2 | 3;

export interface Stage {
  id: string;
  matchId: string;
  number: number;
  name: string;
  minRounds: number;
  paperTargets: number;
  /** How many hits each paper target needs (1, 2 or 3). */
  hitsPerPaperTarget: HitsPerPaperTarget;
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

/** Fields every saved result has, whatever its outcome. */
interface StageScoreBase {
  id: string;
  matchId: string;
  stageId: string;
  shooterId: string;
  roId: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

/** A shot stage: time and hits. Only a scored result carries them. */
export interface ScoredStageScore extends StageScoreBase {
  status: "scored";
  /** Seconds, always above 0: a result cannot be saved without a time. */
  timeSec: number;
  /** One array per paper target; each has at most the stage's hitsPerPaperTarget hits, in tap order. */
  paper: HitCode[][];
  /** One entry per steel target. */
  steel: SteelHit[];
  noShoots: number;
  procedurals: number;
  /** The shooter accepted the reviewed score. */
  shooterAccepted: boolean;
}

/** Did not finish the stage. No time, no hits. */
export interface DnfStageScore extends StageScoreBase {
  status: "dnf";
  /** Stable code, shown through the message `reason.dnf.<code>`. */
  dnfReason: DnfReason;
}

/** Disqualified. Lasts for the rest of the match (see shared/domain/progress.ts). No time, no hits. */
export interface DqStageScore extends StageScoreBase {
  status: "dq";
  /** Stable code, shown through the message `reason.dq.<code>`. */
  dqReason: DqReason;
}

/**
 * One saved result of one shooter on one stage. Switch on `status` to get the fields that belong to
 * it: a DNF or DQ cannot have hits, and a scored result always has a time.
 */
export type StageScore = ScoredStageScore | DnfStageScore | DqStageScore;

/** Roll call result for one shooter: here, or did not show. */
export type AttendanceStatus = "present" | "dns";

/**
 * One shooter's roll call on one day. There is at most one record per shooter per day (the id is
 * derived from both), so a day's roll call can be corrected by saving again. Roll call is repeated
 * each day of a match; the latest record decides whether a shooter is still starting.
 */
export interface Attendance {
  id: string;
  matchId: string;
  shooterId: string;
  /** Calendar day of the roll call, "YYYY-MM-DD" in the match's time zone (see `dayOf`). */
  day: string;
  status: AttendanceStatus;
  /** The range officer who made the entry. */
  roId: string;
  updatedAt: string;
}

/**
 * A shooter moved to another squad for the whole match (see `squad-moves.ts`). One record per shooter: the
 * latest move is the one that counts.
 */
export interface SquadMove {
  shooterId: string;
  matchId: string;
  /** The squad the shooter was moved to. */
  squadId: string;
  /** ISO timestamp from the repository clock; decides the order when several shooters join one squad. */
  movedAt: string;
  /** The range officer who moved them. */
  movedBy: string;
}

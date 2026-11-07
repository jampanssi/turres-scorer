import type { Attendance, Match, Shooter, Squad, Stage, StageScore } from "@/shared/domain/types";

/**
 * The seam between the app and its data source. Screens use only this interface.
 * Today it is backed by mock data + IndexedDB; SSI is added later behind an API-backed implementation.
 */
export interface Repository {
  listMatches(): Promise<Match[]>;
  getMatch(matchId: string): Promise<Match | null>;

  listStages(matchId: string): Promise<Stage[]>;
  getStage(stageId: string): Promise<Stage | null>;

  listSquads(matchId: string): Promise<Squad[]>;
  getSquad(squadId: string): Promise<Squad | null>;

  /** Shooters of a squad, in shooting order. */
  listShooters(squadId: string): Promise<Shooter[]>;
  getShooter(shooterId: string): Promise<Shooter | null>;

  /** All saved scores of a match, optionally limited to one stage. */
  listScores(matchId: string, filter?: { stageId?: string }): Promise<StageScore[]>;
  getScore(stageId: string, shooterId: string): Promise<StageScore | null>;
  /** Insert or replace the score of one shooter on one stage. Notifies subscribers once it is stored. */
  saveScore(score: StageScore): Promise<void>;

  /** All roll call records of a match, every day. */
  listAttendance(matchId: string): Promise<Attendance[]>;
  /** Insert or replace roll call records (by id) in one go. Notifies subscribers once. */
  saveAttendance(records: Attendance[]): Promise<void>;

  /**
   * Call `listener` after the data changed (a result was saved here, or later a sync brought new data),
   * so queries can refresh. Returns the unsubscribe function.
   */
  subscribe(listener: () => void): () => void;

  /**
   * The current time as an ISO timestamp, for createdAt/updatedAt. It comes from the repository so it
   * can be the server's clock later, and so tests can fix it.
   */
  now(): string;
}

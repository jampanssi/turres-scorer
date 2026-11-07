import { scoreId } from "@/shared/domain/ids";
import { isCompleted } from "@/shared/domain/match-state";
import type { Attendance, Match, MatchCompletion, StageScore } from "@/shared/domain/types";
import { RepositoryError } from "../errors";
import { createMemoryMatchStore, type MatchStore } from "../match-store";
import type { Repository } from "../repository";
import type { Catalog } from "./catalog";
import { type AttendanceStore, createMemoryAttendanceStore } from "../attendance-store";
import type { ScoreStore } from "../score-store";

interface CatalogRepositoryOptions {
  /** The clock; defaults to the system time. Tests pass a fixed one. */
  now?: () => string;
  /** Where roll call records are saved; defaults to memory. */
  attendance?: AttendanceStore;
  /** Read-only sample roll call records; a saved record with the same id overrides one. */
  seedAttendance?: Attendance[];
  /** Where match completions are saved; defaults to memory. */
  matches?: MatchStore;
}

/**
 * Repository over an in-memory catalog (matches, stages, squads, shooters) and a ScoreStore for
 * scores. `seedScores` are read-only sample results; a saved score with the same id overrides one.
 */
export function createCatalogRepository(
  catalog: Catalog,
  scores: ScoreStore,
  seedScores: StageScore[] = [],
  {
    now = () => new Date().toISOString(),
    attendance = createMemoryAttendanceStore(),
    seedAttendance = [],
    matches = createMemoryMatchStore(),
  }: CatalogRepositoryOptions = {},
): Repository {
  const listeners = new Set<() => void>();
  const byId = <T extends { id: string }>(items: T[], id: string): T | null =>
    items.find((item) => item.id === id) ?? null;
  const seeds = new Map(seedScores.map((s) => [s.id, s]));
  const attendanceSeeds = new Map(seedAttendance.map((a) => [a.id, a]));

  /** The catalog match with its completion (if any) laid over it. */
  const withCompletion = (match: Match, completion: MatchCompletion | null | undefined): Match =>
    completion
      ? {
          ...match,
          status: "finished",
          resultsVisibility: completion.visibility,
          completedAt: completion.completedAt,
          completedBy: completion.completedBy,
        }
      : match;
  const getMatch = async (matchId: string) => {
    const match = byId(catalog.matches, matchId);
    return match ? withCompletion(match, await matches.get(matchId)) : null;
  };
  /** A change to a completed match is refused. Unknown matches are not this check's business. */
  const assertOpen = async (matchId: string) => {
    const match = await getMatch(matchId);
    if (match && isCompleted(match)) throw new RepositoryError("matchCompleted");
  };

  return {
    async listMatches() {
      const completions = new Map((await matches.list()).map((c) => [c.matchId, c]));
      return catalog.matches.map((match) => withCompletion(match, completions.get(match.id)));
    },
    getMatch,
    async completeMatch(matchId, { visibility, roId }) {
      const match = await getMatch(matchId);
      if (!match) throw new RepositoryError("matchNotFound");
      if (isCompleted(match)) throw new RepositoryError("matchCompleted");
      await matches.put({ matchId, visibility, completedAt: now(), completedBy: roId });
      listeners.forEach((listener) => listener());
    },

    async listStages(matchId) {
      return catalog.stages.filter((s) => s.matchId === matchId).sort((a, b) => a.number - b.number);
    },
    async getStage(stageId) {
      return byId(catalog.stages, stageId);
    },

    async listSquads(matchId) {
      return catalog.squads.filter((s) => s.matchId === matchId).sort((a, b) => a.number - b.number);
    },
    async getSquad(squadId) {
      return byId(catalog.squads, squadId);
    },

    async listShooters(squadId) {
      const squad = byId(catalog.squads, squadId);
      if (!squad) return [];
      return squad.shooterIds.flatMap((id) => byId(catalog.shooters, id) ?? []);
    },
    async getShooter(shooterId) {
      return byId(catalog.shooters, shooterId);
    },

    async listScores(matchId, filter) {
      const merged = new Map<string, StageScore>();
      for (const seed of seeds.values()) if (seed.matchId === matchId) merged.set(seed.id, seed);
      for (const saved of await scores.listByMatch(matchId)) merged.set(saved.id, saved);
      const all = [...merged.values()];
      return filter?.stageId ? all.filter((s) => s.stageId === filter.stageId) : all;
    },
    async getScore(stageId, shooterId) {
      const id = scoreId(stageId, shooterId);
      return (await scores.get(id)) ?? seeds.get(id) ?? null;
    },
    async saveScore(score) {
      await assertOpen(score.matchId);
      await scores.put(score);
      listeners.forEach((listener) => listener());
    },
    async listAttendance(matchId) {
      const merged = new Map<string, Attendance>();
      for (const seed of attendanceSeeds.values()) if (seed.matchId === matchId) merged.set(seed.id, seed);
      for (const saved of await attendance.listByMatch(matchId)) merged.set(saved.id, saved);
      return [...merged.values()];
    },
    async saveAttendance(records) {
      for (const matchId of new Set(records.map((r) => r.matchId))) await assertOpen(matchId);
      await attendance.putMany(records);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    now,
  };
}

import { scoreId } from "@/shared/domain/ids";
import type { StageScore } from "@/shared/domain/types";
import type { Repository } from "../repository";
import type { Catalog } from "./catalog";
import type { ScoreStore } from "../score-store";

interface CatalogRepositoryOptions {
  /** The clock; defaults to the system time. Tests pass a fixed one. */
  now?: () => string;
}

/**
 * Repository over an in-memory catalog (matches, stages, squads, shooters) and a ScoreStore for
 * scores. `seedScores` are read-only sample results; a saved score with the same id overrides one.
 */
export function createCatalogRepository(
  catalog: Catalog,
  scores: ScoreStore,
  seedScores: StageScore[] = [],
  { now = () => new Date().toISOString() }: CatalogRepositoryOptions = {},
): Repository {
  const listeners = new Set<() => void>();
  const byId = <T extends { id: string }>(items: T[], id: string): T | null =>
    items.find((item) => item.id === id) ?? null;
  const seeds = new Map(seedScores.map((s) => [s.id, s]));

  return {
    async listMatches() {
      return catalog.matches;
    },
    async getMatch(matchId) {
      return byId(catalog.matches, matchId);
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
      await scores.put(score);
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

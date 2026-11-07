import type { Repository } from "./repository";
import type { Catalog } from "./mock";
import type { ScoreStore } from "./score-store";

/** Repository over an in-memory catalog (matches, stages, squads, shooters) and a ScoreStore for scores. */
export function createCatalogRepository(catalog: Catalog, scores: ScoreStore): Repository {
  const byId = <T extends { id: string }>(items: T[], id: string): T | null =>
    items.find((item) => item.id === id) ?? null;

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
      const all = await scores.listByMatch(matchId);
      return filter?.stageId ? all.filter((s) => s.stageId === filter.stageId) : all;
    },
    async getScore(stageId, shooterId) {
      return scores.get(`${stageId}:${shooterId}`);
    },
    async saveScore(score) {
      await scores.put(score);
    },
  };
}

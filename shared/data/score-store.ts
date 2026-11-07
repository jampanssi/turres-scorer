import type { StageScore } from "@/shared/domain/types";

/** Local persistence for scores. IndexedDB in the browser, in-memory for tests and non-browser use. */
export interface ScoreStore {
  get(id: string): Promise<StageScore | null>;
  put(score: StageScore): Promise<void>;
  listByMatch(matchId: string): Promise<StageScore[]>;
}

export function createMemoryScoreStore(): ScoreStore {
  const scores = new Map<string, StageScore>();
  return {
    async get(id) {
      const found = scores.get(id);
      return found ? structuredClone(found) : null;
    },
    async put(score) {
      scores.set(score.id, structuredClone(score));
    },
    async listByMatch(matchId) {
      return [...scores.values()].filter((s) => s.matchId === matchId).map((s) => structuredClone(s));
    },
  };
}

import type { SquadMove } from "@/shared/domain/types";

/** Local persistence for squad moves. IndexedDB in the browser, in-memory for tests and non-browser use. */
export interface SquadMoveStore {
  /** Insert or replace the move of a shooter (one record per shooter). */
  put(move: SquadMove): Promise<void>;
  listByMatch(matchId: string): Promise<SquadMove[]>;
}

export function createMemorySquadMoveStore(): SquadMoveStore {
  const moves = new Map<string, SquadMove>();
  return {
    async put(move) {
      moves.set(move.shooterId, structuredClone(move));
    },
    async listByMatch(matchId) {
      return [...moves.values()].filter((m) => m.matchId === matchId).map((m) => structuredClone(m));
    },
  };
}

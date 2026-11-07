import type { MatchCompletion } from "@/shared/domain/types";

/** Local persistence for match completions. IndexedDB in the browser, in-memory for tests and non-browser use. */
export interface MatchStore {
  get(matchId: string): Promise<MatchCompletion | null>;
  put(completion: MatchCompletion): Promise<void>;
  list(): Promise<MatchCompletion[]>;
}

export function createMemoryMatchStore(): MatchStore {
  const completions = new Map<string, MatchCompletion>();
  return {
    async get(matchId) {
      const found = completions.get(matchId);
      return found ? structuredClone(found) : null;
    },
    async put(completion) {
      completions.set(completion.matchId, structuredClone(completion));
    },
    async list() {
      return [...completions.values()].map((c) => structuredClone(c));
    },
  };
}

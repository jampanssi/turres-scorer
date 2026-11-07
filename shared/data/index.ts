import { createIndexedDbScoreStore } from "./local";
import { buildMockCatalog } from "./mock";
import { createCatalogRepository } from "./mock-repository";
import { buildMockScores } from "./mock-scores";
import type { Repository } from "./repository";
import { createMemoryScoreStore } from "./score-store";

export type { Repository } from "./repository";
export { scoreId } from "./repository";

let instance: Repository | null = null;

/**
 * The app-wide repository. Uses IndexedDB when available (browser), memory otherwise.
 * Swap this one function to move to an API-backed repository when SSI is added.
 */
export function getRepository(): Repository {
  if (!instance) {
    const scores = typeof indexedDB === "undefined" ? createMemoryScoreStore() : createIndexedDbScoreStore();
    const catalog = buildMockCatalog();
    instance = createCatalogRepository(catalog, scores, buildMockScores(catalog));
  }
  return instance;
}

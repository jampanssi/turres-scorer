import { createIndexedDbScoreStore } from "../local";
import type { Repository } from "../repository";
import { createMemoryScoreStore } from "../score-store";
import { buildMockCatalog } from "./catalog";
import { createCatalogRepository } from "./repository";
import { buildMockScores } from "./scores";

/**
 * The mock data source: a sample catalog and sample results, with saved results kept in IndexedDB
 * (memory where there is no IndexedDB). Only `shared/data/index.ts` imports this, and only when the
 * mock data source is configured, so the sample data stays out of other builds.
 */
export function createMockRepository(): Repository {
  const scores = typeof indexedDB === "undefined" ? createMemoryScoreStore() : createIndexedDbScoreStore();
  const catalog = buildMockCatalog();
  return createCatalogRepository(catalog, scores, buildMockScores(catalog));
}

import { createMemoryAttendanceStore } from "../attendance-store";
import {
  createIndexedDbAttendanceStore,
  createIndexedDbMatchStore,
  createIndexedDbScoreStore,
  createIndexedDbSquadMoveStore,
} from "../local";
import { createMemoryMatchStore } from "../match-store";
import { dayOf } from "@/shared/domain/attendance";
import type { Repository } from "../repository";
import { createMemoryScoreStore } from "../score-store";
import { createMemorySquadMoveStore } from "../squad-move-store";
import { buildMockAttendance } from "./attendance";
import { buildMockCatalog } from "./catalog";
import { createCatalogRepository } from "./repository";
import { buildMockScores } from "./scores";

/**
 * The mock data source: a sample catalog and sample results, with saved results kept in IndexedDB
 * (memory where there is no IndexedDB). Only `shared/data/index.ts` imports this, and only when the
 * mock data source is configured, so the sample data stays out of other builds.
 */
export function createMockRepository(): Repository {
  const browser = typeof indexedDB !== "undefined";
  const scores = browser ? createIndexedDbScoreStore() : createMemoryScoreStore();
  const attendance = browser ? createIndexedDbAttendanceStore() : createMemoryAttendanceStore();
  const matches = browser ? createIndexedDbMatchStore() : createMemoryMatchStore();
  const squadMoves = browser ? createIndexedDbSquadMoveStore() : createMemorySquadMoveStore();
  const catalog = buildMockCatalog();
  const now = new Date().toISOString();
  return createCatalogRepository(catalog, scores, buildMockScores(catalog), {
    attendance,
    matches,
    squadMoves,
    seedAttendance: buildMockAttendance(catalog, dayOf(now), now),
  });
}

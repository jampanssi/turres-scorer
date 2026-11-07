import { describe, expect, it } from "vitest";
import { buildMockCatalog } from "@/shared/data/mock/catalog";
import { createCatalogRepository } from "@/shared/data/mock/repository";
import { createMemoryScoreStore } from "@/shared/data/score-store";
import { dnfResult, dqResult, scoredResult } from "@/shared/domain/test-fixtures";
import type { StageScore } from "@/shared/domain/types";
import { loadMatchSummaries, summariesForTab } from "./summary";

const names = (list: Array<{ match: { name: string } }>) => list.map((s) => s.match.name);

async function load(scores: StageScore[] = []) {
  const store = createMemoryScoreStore();
  for (const score of scores) await store.put(score);
  return loadMatchSummaries(createCatalogRepository(buildMockCatalog(), store));
}

const MATCH = "autumn-2026";
const autumn = async (scores: StageScore[]) => (await load(scores)).find((s) => s.match.id === MATCH)!;

// Real shooters and stages of the live match: results of unknown shooters are ignored.
const [first, second] = buildMockCatalog().squads.find((s) => s.matchId === MATCH)!.shooterIds;
const stage = (n: number) => `${MATCH}-st${n}`;
const at = (n: number, shooterId = first) => ({ stageId: stage(n), shooterId, matchId: MATCH });

describe("loadMatchSummaries", () => {
  it("counts stages, squads, shooters and total scores", async () => {
    expect(await autumn([])).toMatchObject({ stages: 6, squads: 8, shooters: 64, scored: 0, totalScores: 384 });
  });

  it("counts saved results: scored and DNF", async () => {
    const scores = [scoredResult(at(1, first)), dnfResult(at(1, second))];
    expect((await autumn(scores)).scored).toBe(2);
  });

  it("counts the DQ result as scored too", async () => {
    const scores = [scoredResult(at(1, first)), dqResult(at(2, first)), scoredResult(at(1, second))];
    expect((await autumn(scores)).scored).toBe(3);
  });

  it("a DQ counts on its own stage, but the shooter's later stages leave the total", async () => {
    // 64 shooters x 6 stages = 384. One shooter is DQ'd on stage 1: that one result stays in the total
    // and in scored, and their other 5 stages are no longer expected -> 63 x 6 + 1 = 379.
    expect(await autumn([dqResult(at(1))])).toMatchObject({ shooters: 64, scored: 1, totalScores: 379 });
  });

  it("keeps a DQ'd shooter's earlier results in both numbers", async () => {
    // scored on stage 1, DQ on stage 2 -> 2 results kept, 4 later stages dropped: 63 x 6 + 2 = 380
    expect(await autumn([scoredResult(at(1)), dqResult(at(2))])).toMatchObject({ scored: 2, totalScores: 380 });
  });

  it("ignores results of shooters who are in no squad of the match", async () => {
    expect((await autumn([scoredResult({ ...at(1), shooterId: "stranger" })])).scored).toBe(0);
  });
});

describe("summariesForTab", () => {
  it("open tab: live first, then upcoming by date", async () => {
    expect(names(summariesForTab(await load(), "open"))).toEqual([
      "Autumn Match 2026",
      "Club Night Match #11",
      "Winter Cup · Round 1",
    ]);
  });
  it("results tab: finished matches, newest first", async () => {
    expect(names(summariesForTab(await load(), "results"))).toEqual([
      "Club Night Match #10",
      "Autumn Stage Match 2026",
      "Summer Match 2026",
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { buildMockCatalog } from "@/shared/data/mock";
import { createCatalogRepository } from "@/shared/data/mock-repository";
import { scoreId } from "@/shared/data/repository";
import { createMemoryScoreStore } from "@/shared/data/score-store";
import type { StageScore } from "@/shared/domain/types";
import { loadMatchSummaries, summariesForTab } from "./summary";

const names = (list: Array<{ match: { name: string } }>) => list.map((s) => s.match.name);

async function load(scores: StageScore[] = []) {
  const store = createMemoryScoreStore();
  for (const score of scores) await store.put(score);
  return loadMatchSummaries(createCatalogRepository(buildMockCatalog(), store));
}

describe("loadMatchSummaries", () => {
  it("counts stages, squads, shooters and total scores", async () => {
    const autumn = (await load()).find((s) => s.match.id === "autumn-2026")!;
    expect(autumn).toMatchObject({ stages: 6, squads: 8, shooters: 64, scored: 0, totalScores: 384 });
  });

  const base = {
    matchId: "autumn-2026", roId: "ro-1", timeSec: null, paper: [], steel: [], noShoots: 0, procedurals: 0,
    shooterAccepted: false, createdAt: "", updatedAt: "",
  };
  const autumn = async (scores: StageScore[]) => (await load(scores)).find((s) => s.match.id === "autumn-2026")!;

  it("counts saved results: scored and DNF", async () => {
    const scores: StageScore[] = [
      { ...base, id: scoreId("s1", "a"), stageId: "s1", shooterId: "a", status: "scored" },
      { ...base, id: scoreId("s1", "b"), stageId: "s1", shooterId: "b", status: "dnf" },
    ];
    expect((await autumn(scores)).scored).toBe(2);
  });

  it("counts every saved result, the DQ included", async () => {
    const scores: StageScore[] = [
      { ...base, id: scoreId("s1", "a"), stageId: "s1", shooterId: "a", status: "scored" },
      { ...base, id: scoreId("s2", "a"), stageId: "s2", shooterId: "a", status: "dq" },
      { ...base, id: scoreId("s1", "b"), stageId: "s1", shooterId: "b", status: "scored" },
    ];
    expect((await autumn(scores)).scored).toBe(3);
  });

  it("a DQ counts on its own stage, but the shooter's later stages leave the total", async () => {
    // 64 shooters x 6 stages = 384. One shooter is DQ'd on stage 1: that one result stays in the total
    // and in scored, and their other 5 stages are no longer expected -> 63 x 6 + 1 = 379.
    const catalog = buildMockCatalog();
    const shooterId = catalog.squads.find((s) => s.matchId === "autumn-2026")!.shooterIds[0];
    const dq: StageScore = { ...base, id: scoreId("autumn-2026-st1", shooterId), stageId: "autumn-2026-st1", shooterId, status: "dq" };
    expect(await autumn([dq])).toMatchObject({ shooters: 64, scored: 1, totalScores: 379 });
  });

  it("keeps a DQ'd shooter's earlier results in both numbers", async () => {
    const catalog = buildMockCatalog();
    const shooterId = catalog.squads.find((s) => s.matchId === "autumn-2026")!.shooterIds[0];
    const result = (stage: number, status: StageScore["status"]): StageScore => ({
      ...base, id: scoreId(`autumn-2026-st${stage}`, shooterId), stageId: `autumn-2026-st${stage}`, shooterId, status,
    });
    // scored on stage 1, DQ on stage 2 -> 2 results kept, 4 later stages dropped: 63 x 6 + 2 = 380
    expect(await autumn([result(1, "scored"), result(2, "dq")])).toMatchObject({ scored: 2, totalScores: 380 });
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

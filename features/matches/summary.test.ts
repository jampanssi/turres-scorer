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

  it("counts saved scores, including DNF and DQ", async () => {
    const base = {
      matchId: "autumn-2026", roId: "ro-1", timeSec: null, paper: [], steel: [], noShoots: 0, procedurals: 0,
      shooterAccepted: false, createdAt: "", updatedAt: "",
    };
    const scores: StageScore[] = [
      { ...base, id: scoreId("s1", "a"), stageId: "s1", shooterId: "a", status: "scored" },
      { ...base, id: scoreId("s1", "b"), stageId: "s1", shooterId: "b", status: "dnf" },
      { ...base, id: scoreId("s2", "a"), stageId: "s2", shooterId: "a", status: "dq" },
    ];
    expect((await load(scores)).find((s) => s.match.id === "autumn-2026")!.scored).toBe(3);
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

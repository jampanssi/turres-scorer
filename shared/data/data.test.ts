import { beforeEach, describe, expect, it } from "vitest";
import { scoredResult } from "@/shared/domain/test-fixtures";
import type { ScoredStageScore, StageScore } from "@/shared/domain/types";
import { buildMockCatalog } from "./mock";
import { createCatalogRepository } from "./mock-repository";
import { type Repository } from "./repository";
import { createMemoryScoreStore } from "./score-store";

const MATCH = "autumn-2026";

function makeScore(stageId: string, shooterId: string, overrides: Partial<ScoredStageScore> = {}): StageScore {
  return scoredResult({ stageId, shooterId, matchId: MATCH, timeSec: 8.42, ...overrides });
}

/** The time of a scored result (DNF and DQ have none). */
const timeOf = (score: StageScore | null) => (score?.status === "scored" ? score.timeSec : undefined);

describe("mock catalog", () => {
  const catalog = buildMockCatalog();

  it("has the sample matches with the counts shown in the design", () => {
    const counts = (id: string) => ({
      status: catalog.matches.find((m) => m.id === id)!.status,
      stages: catalog.stages.filter((s) => s.matchId === id).length,
      squads: catalog.squads.filter((s) => s.matchId === id).length,
      shooters: catalog.shooters.filter((s) => s.id.startsWith(`${id}-sh`)).length,
    });
    expect(counts("autumn-2026")).toEqual({ status: "live", stages: 6, squads: 8, shooters: 64 });
    expect(counts("club-night-11")).toEqual({ status: "open", stages: 4, squads: 3, shooters: 22 });
    expect(counts("winter-cup-1")).toEqual({ status: "open", stages: 5, squads: 5, shooters: 37 });
    expect(counts("summer-2026")).toEqual({ status: "finished", stages: 6, squads: 7, shooters: 52 });
  });

  it("splits shooters evenly across squads (sizes differ by at most one)", () => {
    for (const match of catalog.matches) {
      const sizes = catalog.squads.filter((s) => s.matchId === match.id).map((s) => s.shooterIds.length);
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    }
  });

  it("references only existing stages and shooters", () => {
    const stageIds = new Set(catalog.stages.map((s) => s.id));
    const shooterIds = new Set(catalog.shooters.map((s) => s.id));
    for (const squad of catalog.squads) {
      expect(squad.shooterIds.every((id) => shooterIds.has(id))).toBe(true);
      expect(squad.stageRotation.every((id) => stageIds.has(id))).toBe(true);
    }
  });

  it("rotates every squad through all stages of its match", () => {
    for (const squad of catalog.squads) {
      const match = catalog.matches.find((m) => m.id === squad.matchId)!;
      expect([...squad.stageRotation].sort()).toEqual([...match.stageIds].sort());
    }
  });

  it("matches the mock-up stage 3: 6 paper, 3 steel, 2 no-shoots, min. 15 rounds", () => {
    const stage = catalog.stages.find((s) => s.id === `${MATCH}-st3`)!;
    expect(stage).toMatchObject({
      name: "Rapid Entry",
      paperTargets: 6,
      steelTargets: 3,
      noShootTargets: 2,
      minRounds: 15,
    });
  });
});

describe("repository", () => {
  let repo: Repository;
  beforeEach(() => {
    repo = createCatalogRepository(buildMockCatalog(), createMemoryScoreStore());
  });

  it("lists stages and squads of a match in order", async () => {
    expect((await repo.listStages(MATCH)).map((s) => s.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(await repo.listSquads(MATCH)).toHaveLength(8);
  });

  it("lists shooters of a squad in shooting order", async () => {
    const squad = (await repo.getSquad(`${MATCH}-sq3`))!;
    const shooters = await repo.listShooters(squad.id);
    expect(shooters.map((s) => s.id)).toEqual(squad.shooterIds);
    expect(shooters.find((s) => s.competitorNumber === 23)?.name).toBe("Antti Mäkelä");
  });

  it("returns null or empty for unknown ids", async () => {
    expect(await repo.getMatch("nope")).toBeNull();
    expect(await repo.listShooters("nope")).toEqual([]);
  });

  it("saves, reads back and replaces a score", async () => {
    const stageId = `${MATCH}-st3`;
    const shooterId = `${MATCH}-sh23`;
    expect(await repo.getScore(stageId, shooterId)).toBeNull();

    await repo.saveScore(makeScore(stageId, shooterId));
    expect(timeOf(await repo.getScore(stageId, shooterId))).toBe(8.42);

    await repo.saveScore(makeScore(stageId, shooterId, { timeSec: 7.9 }));
    expect(timeOf(await repo.getScore(stageId, shooterId))).toBe(7.9);
    expect(await repo.listScores(MATCH)).toHaveLength(1);
  });

  it("filters scores by stage", async () => {
    await repo.saveScore(makeScore(`${MATCH}-st1`, `${MATCH}-sh1`));
    await repo.saveScore(makeScore(`${MATCH}-st2`, `${MATCH}-sh1`));
    expect(await repo.listScores(MATCH, { stageId: `${MATCH}-st2` })).toHaveLength(1);
  });
});

describe("hits per paper target in the mock stages", () => {
  const catalog = buildMockCatalog();
  const stage = (number: number) => catalog.stages.find((s) => s.id === `autumn-2026-st${number}`)!;

  it("most stages need 2 hits, some 1 or 3", () => {
    expect(catalog.stages.every((s) => [1, 2, 3].includes(s.hitsPerPaperTarget))).toBe(true);
    expect(stage(3).hitsPerPaperTarget).toBe(2);
    expect(stage(5).hitsPerPaperTarget).toBe(1);
    expect(stage(6).hitsPerPaperTarget).toBe(3);
  });

  it("minimum rounds follow the stage's hits: paper x hits + steel", () => {
    expect(stage(3).minRounds).toBe(15); // 6 x 2 + 3, the mock-up stage
    expect(stage(5).minRounds).toBe(6); // 4 x 1 + 2
    expect(stage(6).minRounds).toBe(20); // 6 x 3 + 2
  });
});

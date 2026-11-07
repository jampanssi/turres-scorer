import { beforeEach, describe, expect, it } from "vitest";
import type { StageScore } from "@/shared/domain/types";
import { buildMockCatalog } from "./mock";
import { createCatalogRepository } from "./mock-repository";
import { type Repository, scoreId } from "./repository";
import { createMemoryScoreStore } from "./score-store";

const MATCH = "autumn-2026";

function makeScore(stageId: string, shooterId: string, overrides: Partial<StageScore> = {}): StageScore {
  return {
    id: scoreId(stageId, shooterId),
    matchId: MATCH,
    stageId,
    shooterId,
    roId: "ro-1",
    status: "scored",
    timeSec: 8.42,
    paper: [["A", "A"]],
    steel: ["A"],
    noShoots: 0,
    procedurals: 0,
    shooterAccepted: true,
    createdAt: "2026-11-07T10:00:00Z",
    updatedAt: "2026-11-07T10:00:00Z",
    ...overrides,
  };
}

describe("mock catalog", () => {
  const catalog = buildMockCatalog();

  it("has the sample matches with 64 shooters in the live match", () => {
    expect(catalog.matches.map((m) => m.status)).toEqual(["live", "open", "finished"]);
    expect(catalog.shooters.filter((s) => s.id.startsWith(MATCH))).toHaveLength(64);
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
    expect(stage).toMatchObject({ name: "Rapid Entry", paperTargets: 6, steelTargets: 3, noShootTargets: 2, minRounds: 15 });
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
    expect((await repo.getScore(stageId, shooterId))?.timeSec).toBe(8.42);

    await repo.saveScore(makeScore(stageId, shooterId, { timeSec: 7.9 }));
    expect((await repo.getScore(stageId, shooterId))?.timeSec).toBe(7.9);
    expect(await repo.listScores(MATCH)).toHaveLength(1);
  });

  it("filters scores by stage", async () => {
    await repo.saveScore(makeScore(`${MATCH}-st1`, `${MATCH}-sh1`));
    await repo.saveScore(makeScore(`${MATCH}-st2`, `${MATCH}-sh1`));
    expect(await repo.listScores(MATCH, { stageId: `${MATCH}-st2` })).toHaveLength(1);
  });
});

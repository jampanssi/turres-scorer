import { describe, expect, it } from "vitest";
import { buildMockCatalog } from "@/shared/data/mock";
import { createCatalogRepository } from "@/shared/data/mock-repository";
import { buildMockScores } from "@/shared/data/mock-scores";
import { createMemoryScoreStore } from "@/shared/data/score-store";
import { loadSquadsOverview, summarizeSquad } from "./summary";

const catalog = buildMockCatalog();
const repo = () => createCatalogRepository(catalog, createMemoryScoreStore(), buildMockScores(catalog));
const MATCH = "autumn-2026";

describe("summarizeSquad", () => {
  const stageList = catalog.stages.filter((s) => s.matchId === MATCH);
  const stages = new Map(stageList.map((s) => [s.id, s]));
  const squad = catalog.squads.find((s) => s.matchId === MATCH && s.number === 2)!;
  const key = (stageId: string, shooterId: string) => `${stageId}:${shooterId}`;

  it("is not started with no results", () => {
    const summary = summarizeSquad(squad, stages, new Set());
    expect(summary).toMatchObject({ status: "notStarted", stagesDone: 0, stagesTotal: 6 });
    expect(summary.currentStage?.id).toBe(squad.stageRotation[0]);
  });

  it("is on range after the first result, and the stage is not done until every shooter has one", () => {
    const scored = new Set([key(squad.stageRotation[0], squad.shooterIds[0])]);
    const summary = summarizeSquad(squad, stages, scored);
    expect(summary).toMatchObject({ status: "onRange", stagesDone: 0 });
  });

  it("moves the current stage along the squad's rotation", () => {
    const scored = new Set(squad.shooterIds.map((id) => key(squad.stageRotation[0], id)));
    const summary = summarizeSquad(squad, stages, scored);
    expect(summary).toMatchObject({ status: "onRange", stagesDone: 1 });
    expect(summary.currentStage?.id).toBe(squad.stageRotation[1]);
  });

  it("is done when every stage is done", () => {
    const scored = new Set(squad.stageRotation.flatMap((stageId) => squad.shooterIds.map((id) => key(stageId, id))));
    const summary = summarizeSquad(squad, stages, scored);
    expect(summary).toMatchObject({ status: "done", stagesDone: 6, currentStage: null });
  });
});

describe("loadSquadsOverview with the sample scores", () => {
  it("matches the progress described in the design", async () => {
    const overview = (await loadSquadsOverview(repo(), MATCH))!;
    expect(overview).toMatchObject({ stageCount: 6, shooterCount: 64 });
    const byNumber = (n: number) => overview.squads.find((s) => s.squad.number === n)!;

    expect(byNumber(1)).toMatchObject({ status: "done", stagesDone: 6 });
    expect(byNumber(2)).toMatchObject({ status: "onRange", stagesDone: 2 });
    expect(byNumber(3)).toMatchObject({ status: "onRange", stagesDone: 3 });
    expect(byNumber(4)).toMatchObject({ status: "done", stagesDone: 6 });
    expect(byNumber(5)).toMatchObject({ status: "onRange", stagesDone: 1 });
    expect(byNumber(6)).toMatchObject({ status: "notStarted", stagesDone: 0 });
  });

  it("returns null for an unknown match", async () => {
    expect(await loadSquadsOverview(repo(), "nope")).toBeNull();
  });
});

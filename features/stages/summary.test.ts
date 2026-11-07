import { describe, expect, it } from "vitest";
import { buildMockCatalog } from "@/shared/data/mock";
import { createCatalogRepository } from "@/shared/data/mock-repository";
import { buildMockScores } from "@/shared/data/mock-scores";
import { createMemoryScoreStore } from "@/shared/data/score-store";
import { loadStagesOverview, summarizeStage } from "./summary";

const catalog = buildMockCatalog();
const repo = () => createCatalogRepository(catalog, createMemoryScoreStore(), buildMockScores(catalog));
const MATCH = "autumn-2026";
const squad2 = catalog.squads.find((s) => s.matchId === MATCH && s.number === 2)!;
const stage = catalog.stages.find((s) => s.matchId === MATCH && s.number === 3)!;

describe("summarizeStage", () => {
  const key = (shooterId: string) => `${stage.id}:${shooterId}`;

  it("is not started with no results", () => {
    expect(summarizeStage(stage, squad2, new Set())).toMatchObject({ scored: 0, total: 8, status: "notStarted" });
  });
  it("is in progress while some shooters are missing", () => {
    const scored = new Set(squad2.shooterIds.slice(0, 3).map(key));
    expect(summarizeStage(stage, squad2, scored)).toMatchObject({ scored: 3, total: 8, status: "inProgress" });
  });
  it("is done when every shooter has a result", () => {
    const scored = new Set(squad2.shooterIds.map(key));
    expect(summarizeStage(stage, squad2, scored)).toMatchObject({ scored: 8, total: 8, status: "done" });
  });
  it("ignores results of other shooters", () => {
    expect(summarizeStage(stage, squad2, new Set([key("someone-else")])).scored).toBe(0);
  });
});

describe("loadStagesOverview with the sample scores", () => {
  it("lists every stage in number order with this squad's progress", async () => {
    const overview = (await loadStagesOverview(repo(), MATCH, squad2.id))!;
    expect(overview.stages.map((s) => s.stage.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(overview.stagesDone).toBe(2);
    // Squad 2's rotation starts on stage 2: stages 2 and 3 are done and stage 4 is part-way (3 of 8).
    const byNumber = (n: number) => overview.stages.find((s) => s.stage.number === n)!;
    expect(byNumber(1).status).toBe("notStarted");
    expect(byNumber(2).status).toBe("done");
    expect(byNumber(3).status).toBe("done");
    expect(byNumber(4)).toMatchObject({ status: "inProgress", scored: 3, total: 8 });
  });

  it("returns null for an unknown squad or a squad of another match", async () => {
    expect(await loadStagesOverview(repo(), MATCH, "nope")).toBeNull();
    expect(await loadStagesOverview(repo(), "club-night-11", squad2.id)).toBeNull();
  });
});

describe("summarizeStage with a disqualified shooter", () => {
  const stage = catalog.stages.find((s) => s.matchId === MATCH && s.number === 3)!;
  const squad = catalog.squads.find((s) => s.matchId === MATCH && s.number === 2)!;
  const key = (id: string) => `${stage.id}:${id}`;

  it("does not wait for a disqualified shooter: the stage can be done without them", () => {
    const [out, ...rest] = squad.shooterIds;
    const summary = summarizeStage(stage, squad, new Set(rest.map(key)), new Set([out]));
    expect(summary).toMatchObject({ scored: 7, total: 7, status: "done" });
  });

  it("counts a disqualified shooter's own result as scored, on the stage where they have one", () => {
    const summary = summarizeStage(stage, squad, new Set(squad.shooterIds.map(key)), new Set([squad.shooterIds[0]]));
    expect(summary).toMatchObject({ scored: 8, total: 8, status: "done" });
  });
});

describe("loadStagesOverview with the sample DQ (squad 3)", () => {
  it("counts squad 3's stages as done although one shooter is out after stage 2", async () => {
    const squad3 = catalog.squads.find((s) => s.matchId === MATCH && s.number === 3)!;
    const overview = (await loadStagesOverview(repo(), MATCH, squad3.id))!;
    expect(overview.stagesDone).toBe(3);
    const third = overview.stages.find((s) => s.stage.id === squad3.stageRotation[2])!;
    expect(third).toMatchObject({ status: "done", scored: 7, total: 7 });
  });
});

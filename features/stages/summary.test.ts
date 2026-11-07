import { describe, expect, it } from "vitest";
import { buildMockAttendance } from "@/shared/data/mock/attendance";
import { buildMockCatalog } from "@/shared/data/mock/catalog";
import { createCatalogRepository } from "@/shared/data/mock/repository";
import { buildMockScores } from "@/shared/data/mock/scores";
import { createMemoryScoreStore } from "@/shared/data/score-store";
import { dayOf } from "@/shared/domain/attendance";
import { createResultIndex } from "@/shared/domain/progress";
import { loadStagesOverview, summarizeStage } from "./summary";

const catalog = buildMockCatalog();
const repo = () => createCatalogRepository(catalog, createMemoryScoreStore(), buildMockScores(catalog));
const MATCH = "autumn-2026";
const squads = catalog.squads.filter((s) => s.matchId === MATCH);
const stage = catalog.stages.find((s) => s.matchId === MATCH && s.number === 3)!;
const key = (shooterId: string) => `${stage.id}:${shooterId}`;
const everyone = squads.flatMap((s) => s.shooterIds);

describe("summarizeStage", () => {
  it("is not started with no results, over every shooter of every squad", () => {
    expect(summarizeStage(stage, squads, createResultIndex([]))).toMatchObject({
      scored: 0,
      total: 64,
      status: "notStarted",
      squadsDone: 0,
    });
  });

  it("is in progress while any shooter is missing, and counts squads that are done", () => {
    const scored = new Set([...squads[0].shooterIds, squads[1].shooterIds[0]].map(key));
    expect(summarizeStage(stage, squads, createResultIndex(scored))).toMatchObject({
      scored: 9,
      total: 64,
      status: "inProgress",
      squadsDone: 1,
    });
  });

  it("is done when every shooter of every squad has a result", () => {
    expect(summarizeStage(stage, squads, createResultIndex(everyone.map(key)))).toMatchObject({
      scored: 64,
      status: "done",
      squadsDone: 8,
    });
  });

  it("ignores results of other stages", () => {
    const otherStage = catalog.stages.find((s) => s.matchId === MATCH && s.number === 4)!;
    const idx = createResultIndex(everyone.map((id) => `${otherStage.id}:${id}`));
    expect(summarizeStage(stage, squads, idx).scored).toBe(0);
  });
});

describe("loadStagesOverview with the sample scores", () => {
  it("lists every stage of the match in number order, with the match counts", async () => {
    const overview = (await loadStagesOverview(repo(), MATCH))!;
    expect(overview.match.id).toBe(MATCH);
    expect(overview.stages.map((s) => s.stage.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(overview.squadCount).toBe(8);
    expect(overview.shooterCount).toBe(64);
  });

  it("adds up the sample results across squads and counts the stages that are done", async () => {
    const overview = (await loadStagesOverview(repo(), MATCH))!;
    const totalScored = overview.stages.reduce((n, s) => n + s.scored, 0);
    const scores = await repo().listScores(MATCH);
    expect(totalScored).toBe(scores.length); // every sample result belongs to an expected shooter
    expect(overview.stagesDone).toBe(overview.stages.filter((s) => s.status === "done").length);
  });

  it("returns null for an unknown match", async () => {
    expect(await loadStagesOverview(repo(), "nope")).toBeNull();
  });
});

describe("DNS on the stage list", () => {
  const NOW = "2026-11-07T10:00:00.000Z";

  it("leaves a DNS shooter out of the total on stages where they have no result", async () => {
    const withDns = createCatalogRepository(catalog, createMemoryScoreStore(), buildMockScores(catalog), {
      now: () => NOW,
      seedAttendance: buildMockAttendance(catalog, dayOf(NOW), NOW),
    });
    const lastStage = (await loadStagesOverview(withDns, MATCH))!.stages.at(-1)!;
    expect(lastStage.total).toBe(62); // one DQ and one DNS shooter are not expected on the last stage
  });
});

describe("completion on the Stages overview", () => {
  it("carries the completion on the match once it is completed", async () => {
    const r = repo();
    await r.completeMatch(MATCH, { visibility: "public", roId: "ro" });
    const overview = (await loadStagesOverview(r, MATCH))!;
    expect(overview.match).toMatchObject({ status: "finished", resultsVisibility: "public" });
  });
});

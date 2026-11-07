import { describe, expect, it } from "vitest";
import { buildMockCatalog } from "@/shared/data/mock/catalog";
import { createCatalogRepository } from "@/shared/data/mock/repository";
import { buildMockScores } from "@/shared/data/mock/scores";
import { createMemoryScoreStore } from "@/shared/data/score-store";
import { createResultIndex } from "@/shared/domain/progress";
import { loadSquadsOverview, summarizeSquad } from "./summary";

const catalog = buildMockCatalog();
const repo = () => createCatalogRepository(catalog, createMemoryScoreStore(), buildMockScores(catalog));
const MATCH = "autumn-2026";
const stage = catalog.stages.find((s) => s.matchId === MATCH && s.number === 3)!;
const squad = catalog.squads.find((s) => s.matchId === MATCH && s.number === 2)!;
const key = (shooterId: string) => `${stage.id}:${shooterId}`;

describe("summarizeSquad", () => {
  it("is not started with no results", () => {
    expect(summarizeSquad(squad, stage, createResultIndex([]))).toMatchObject({
      shooters: 8,
      scored: 0,
      total: 8,
      status: "notStarted",
    });
  });

  it("is in progress while some shooters are missing, done when everyone has a result", () => {
    const some = new Set(squad.shooterIds.slice(0, 3).map(key));
    expect(summarizeSquad(squad, stage, createResultIndex(some))).toMatchObject({ scored: 3, status: "inProgress" });
    const all = new Set(squad.shooterIds.map(key));
    expect(summarizeSquad(squad, stage, createResultIndex(all))).toMatchObject({ scored: 8, status: "done" });
  });

  it("ignores another squad's results and other stages", () => {
    const other = catalog.squads.find((s) => s.matchId === MATCH && s.number === 3)!;
    const otherStage = catalog.stages.find((s) => s.matchId === MATCH && s.number === 4)!;
    const idx = createResultIndex([
      ...other.shooterIds.map(key),
      ...squad.shooterIds.map((id) => `${otherStage.id}:${id}`),
    ]);
    expect(summarizeSquad(squad, stage, idx).scored).toBe(0);
  });

  it("does not wait for a disqualified shooter, and keeps them in the squad's shooter count", () => {
    const [out, ...rest] = squad.shooterIds;
    const summary = summarizeSquad(squad, stage, createResultIndex(rest.map(key), [out]));
    expect(summary).toMatchObject({ shooters: 8, scored: 7, total: 7, status: "done" });
  });

  it("does not wait for a DNS shooter either", () => {
    const [out, ...rest] = squad.shooterIds;
    const summary = summarizeSquad(squad, stage, createResultIndex(rest.map(key), [], [out]));
    expect(summary).toMatchObject({ shooters: 8, total: 7, status: "done" });
  });
});

describe("loadSquadsOverview with the sample scores", () => {
  it("lists every squad of the match in squad number order", async () => {
    const overview = (await loadSquadsOverview(repo(), MATCH, stage.id))!;
    expect(overview.stage.id).toBe(stage.id);
    expect(overview.squads.map((s) => s.squad.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("shows each squad's progress on this stage only (squad 1 finished every stage, squad 8 none)", async () => {
    const byNumber = new Map(
      (await loadSquadsOverview(repo(), MATCH, stage.id))!.squads.map((s) => [s.squad.number, s]),
    );
    expect(byNumber.get(1)).toMatchObject({ scored: 8, total: 8, status: "done" });
    expect(byNumber.get(8)).toMatchObject({ scored: 0, status: "notStarted" });
  });

  it("counts the squads that are done on the stage", async () => {
    const overview = (await loadSquadsOverview(repo(), MATCH, stage.id))!;
    expect(overview.squadsDone).toBe(overview.squads.filter((s) => s.status === "done").length);
  });

  it("returns null for an unknown stage or one from another match", async () => {
    expect(await loadSquadsOverview(repo(), MATCH, "nope")).toBeNull();
    expect(await loadSquadsOverview(repo(), "club-night-11", stage.id)).toBeNull();
  });
});

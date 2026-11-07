import { describe, expect, it } from "vitest";
import { buildMockCatalog } from "@/shared/data/mock";
import { createCatalogRepository } from "@/shared/data/mock-repository";
import { buildMockScores } from "@/shared/data/mock-scores";
import { createMemoryScoreStore } from "@/shared/data/score-store";
import { dnfResult, dqResult, scoredResult } from "@/shared/domain/test-fixtures";
import type { ScoredStageScore, Shooter } from "@/shared/domain/types";
import { buildShooterRows, loadShootersOverview } from "./rows";

const shooters: Shooter[] = [1, 2, 3, 4, 5].map((n) => ({ id: `s${n}`, name: `Shooter ${n}`, competitorNumber: n }));

const result = (shooterId: string, overrides: Partial<ScoredStageScore> = {}) =>
  scoredResult({ stageId: "st", shooterId, ...overrides });
const dnf = (shooterId: string) => dnfResult({ stageId: "st", shooterId });
const dq = (shooterId: string) => dqResult({ stageId: "st", shooterId });

const states = (rows: ReturnType<typeof buildShooterRows>) => rows.map((r) => r.state);

describe("buildShooterRows", () => {
  it("marks the first unscored shooter as shooting, the next on deck, the rest waiting", () => {
    expect(states(buildShooterRows(shooters, [result("s1"), result("s2")]))).toEqual([
      "scored",
      "scored",
      "shooting",
      "onDeck",
      "waiting",
    ]);
  });

  it("starts with the first shooter when nobody has a result", () => {
    expect(states(buildShooterRows(shooters, []))).toEqual(["shooting", "onDeck", "waiting", "waiting", "waiting"]);
  });

  it("has nobody shooting when everyone has a result", () => {
    expect(
      states(
        buildShooterRows(
          shooters,
          shooters.map((s) => result(s.id)),
        ),
      ),
    ).toEqual(Array(5).fill("scored"));
  });

  it("uses the first gap in the order, even if a later shooter is already scored", () => {
    expect(states(buildShooterRows(shooters, [result("s1"), result("s3")]))).toEqual([
      "scored",
      "shooting",
      "scored",
      "onDeck",
      "waiting",
    ]);
  });

  it("shows a DNF in place, as a result", () => {
    const rows = buildShooterRows(shooters, [dnf("s1")]);
    expect(states(rows)).toEqual(["dnf", "shooting", "onDeck", "waiting", "waiting"]);
    expect(rows[0].hitFactor).toBeNull();
  });

  it("moves a shooter with a DQ result to the end, without an order number", () => {
    const rows = buildShooterRows(shooters, [dq("s2")]);
    expect(rows.map((r) => r.shooter.id)).toEqual(["s1", "s3", "s4", "s5", "s2"]);
    expect(states(rows)).toEqual(["shooting", "onDeck", "waiting", "waiting", "dq"]);
    expect(rows.map((r) => r.order)).toEqual([1, 2, 3, 4, null]);
  });

  it("applies a DQ from another stage: out of the order, even with no result on this stage", () => {
    const rows = buildShooterRows(shooters, [result("s1")], new Set(["s2"]));
    expect(rows.map((r) => r.shooter.id)).toEqual(["s1", "s3", "s4", "s5", "s2"]);
    expect(states(rows)).toEqual(["scored", "shooting", "onDeck", "waiting", "dq"]);
  });

  it("keeps disqualified shooters in their original relative order at the end", () => {
    const rows = buildShooterRows(shooters, [], new Set(["s4", "s1"]));
    expect(rows.map((r) => r.shooter.id)).toEqual(["s2", "s3", "s5", "s1", "s4"]);
  });

  it("computes the hit factor from points and time", () => {
    // 2 alphas on paper + 1 steel alpha = 15 points over 10 s
    expect(buildShooterRows(shooters, [result("s1")])[0].hitFactor).toBeCloseTo(1.5, 4);
  });

  it("gives a hit factor of 0 when the time is missing", () => {
    expect(buildShooterRows(shooters, [result("s1", { timeSec: 0 })])[0].hitFactor).toBe(0);
  });

  it("numbers rows from 1 in the given order", () => {
    expect(buildShooterRows(shooters, []).map((r) => r.order)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("loadShootersOverview with the sample scores", () => {
  const catalog = buildMockCatalog();
  const repo = () => createCatalogRepository(catalog, createMemoryScoreStore(), buildMockScores(catalog));
  const MATCH = "autumn-2026";
  const squad2 = catalog.squads.find((s) => s.matchId === MATCH && s.number === 2)!;

  it("shows squad 2 on its in-progress stage: 3 scored, 4th shooting, 5th on deck", async () => {
    const stageId = squad2.stageRotation[2]; // two stages done, the third is part-way
    const overview = (await loadShootersOverview(repo(), MATCH, squad2.id, stageId))!;
    expect(overview.scoredCount).toBe(3);
    expect(states(overview.rows)).toEqual([
      "scored",
      "scored",
      "scored",
      "shooting",
      "onDeck",
      "waiting",
      "waiting",
      "waiting",
    ]);
    expect(overview.rows[0].hitFactor).toBeGreaterThan(0);
  });

  it("returns null for an unknown squad or stage, or ones from another match", async () => {
    const stageId = squad2.stageRotation[0];
    expect(await loadShootersOverview(repo(), MATCH, "nope", stageId)).toBeNull();
    expect(await loadShootersOverview(repo(), MATCH, squad2.id, "nope")).toBeNull();
    expect(await loadShootersOverview(repo(), "club-night-11", squad2.id, stageId)).toBeNull();
  });
});

describe("DQ counts on the shooters screen (sample squad 3)", () => {
  const catalog = buildMockCatalog();
  const repo = () => createCatalogRepository(catalog, createMemoryScoreStore(), buildMockScores(catalog));
  const MATCH = "autumn-2026";
  const squad3 = catalog.squads.find((s) => s.matchId === MATCH && s.number === 3)!;
  // Squad 3's shooter 7 is disqualified on the second stage of its rotation.
  const overview = (rotationIndex: number) =>
    loadShootersOverview(repo(), MATCH, squad3.id, squad3.stageRotation[rotationIndex]).then((o) => o!);

  it("before the DQ: the shooter has a normal result and counts as scored", async () => {
    const o = await overview(0);
    expect(o).toMatchObject({ scoredCount: 8, totalCount: 8 });
    expect(states(o.rows).at(-1)).toBe("dq"); // still shown last and not selectable
  });

  it("on the DQ stage: the DQ counts as scored", async () => {
    const o = await overview(1);
    expect(o).toMatchObject({ scoredCount: 8, totalCount: 8 });
  });

  it("after the DQ: the shooter is not expected, so they are left out of the counts", async () => {
    const done = await overview(2);
    expect(done).toMatchObject({ scoredCount: 7, totalCount: 7 });
    const partial = await overview(3); // 5 of the 7 remaining shooters scored
    expect(partial).toMatchObject({ scoredCount: 5, totalCount: 7 });
    expect(states(partial.rows)).toEqual([
      "scored",
      "scored",
      "scored",
      "scored",
      "scored",
      "shooting",
      "onDeck",
      "dq",
    ]);
  });
});

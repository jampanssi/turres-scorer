import { describe, expect, it } from "vitest";
import { buildMockCatalog } from "./mock";
import { createCatalogRepository } from "./mock-repository";
import { buildMockScores } from "./mock-scores";
import { createMemoryScoreStore } from "./score-store";
import type { ScoredStageScore } from "@/shared/domain/types";

const catalog = buildMockCatalog();
const scores = buildMockScores(catalog);

describe("mock scores", () => {
  it("is deterministic", () => {
    expect(buildMockScores(buildMockCatalog())).toEqual(scores);
  });

  it("has unique ids and only references catalog stages and shooters", () => {
    expect(new Set(scores.map((s) => s.id)).size).toBe(scores.length);
    const stageIds = new Set(catalog.stages.map((s) => s.id));
    const shooterIds = new Set(catalog.shooters.map((s) => s.id));
    for (const s of scores) {
      expect(stageIds.has(s.stageId)).toBe(true);
      expect(shooterIds.has(s.shooterId)).toBe(true);
    }
  });

  it("scored entries match the stage's target counts and penalty limits", () => {
    const stages = new Map(catalog.stages.map((s) => [s.id, s]));
    for (const s of scores.filter((x) => x.status === "scored")) {
      const stage = stages.get(s.stageId)!;
      expect(s.paper).toHaveLength(stage.paperTargets);
      expect(s.paper.every((row) => row.length === stage.hitsPerPaperTarget)).toBe(true);
      expect(s.steel).toHaveLength(stage.steelTargets);
      expect(s.noShoots).toBeLessThanOrEqual(stage.noShootTargets * 2);
      expect(s.procedurals).toBeLessThanOrEqual(
        Math.ceil((stage.paperTargets * stage.hitsPerPaperTarget * 5 + stage.steelTargets * 5) / 10),
      );
      expect(s.timeSec).toBeGreaterThan(0);
    }
  });

  it("covers squads of the live match: 2 done, 3 on range, others not started", () => {
    const scoredBy = (squadNumber: number) => {
      const squad = catalog.squads.find((s) => s.matchId === "autumn-2026" && s.number === squadNumber)!;
      return scores.filter((s) => squad.shooterIds.includes(s.shooterId)).length;
    };
    expect(scoredBy(1)).toBe(48); // 6 stages x 8 shooters
    expect(scoredBy(2)).toBe(19); // 2 stages + 3 on the third
    expect(scoredBy(6)).toBe(0);
    expect(scores).toHaveLength(151); // squad 3 has one result fewer: its DQ'd shooter is out after stage 2
  });

  it("includes one DNF, which has a reason but no time or hits", () => {
    const dnf = scores.filter((s) => s.status === "dnf");
    expect(dnf).toHaveLength(1);
    expect(dnf[0]).toMatchObject({ dnfReason: "equipment_failure" });
    expect("timeSec" in dnf[0] || "paper" in dnf[0]).toBe(false);
  });
});

describe("repository with seed scores", () => {
  it("lists seeds, and a saved score overrides a seed with the same id", async () => {
    const repo = createCatalogRepository(catalog, createMemoryScoreStore(), scores);
    expect(await repo.listScores("autumn-2026")).toHaveLength(151);
    expect(await repo.listScores("club-night-11")).toHaveLength(0);

    const seed = scores.find((s): s is ScoredStageScore => s.status === "scored")!;
    expect((await repo.getScore(seed.stageId, seed.shooterId))?.id).toBe(seed.id);

    await repo.saveScore({ ...seed, timeSec: 1.23 });
    const saved = await repo.getScore(seed.stageId, seed.shooterId);
    expect(saved?.status === "scored" && saved.timeSec).toBe(1.23);
    expect(await repo.listScores("autumn-2026")).toHaveLength(151);
  });
});

describe("sample DQ", () => {
  it("has one disqualified shooter with no results after the DQ stage", () => {
    const dq = scores.filter((s) => s.status === "dq");
    expect(dq).toHaveLength(1);
    expect(dq[0]).toMatchObject({ dqReason: "unsafe_handling" });
    expect("timeSec" in dq[0] || "paper" in dq[0]).toBe(false);

    const squad = catalog.squads.find((s) => s.shooterIds.includes(dq[0].shooterId))!;
    const dqStageIndex = squad.stageRotation.indexOf(dq[0].stageId);
    const later = squad.stageRotation.slice(dqStageIndex + 1);
    expect(later.length).toBeGreaterThan(0);
    expect(scores.filter((s) => s.shooterId === dq[0].shooterId && later.includes(s.stageId))).toHaveLength(0);
  });
});

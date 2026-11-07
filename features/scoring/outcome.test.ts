import { describe, expect, it } from "vitest";
import { buildMockCatalog } from "@/shared/data/mock";
import { createCatalogRepository } from "@/shared/data/mock-repository";
import { createMemoryScoreStore } from "@/shared/data/score-store";
import { DNF_REASONS, type StageScore } from "@/shared/domain/types";
import { buildDnfScore } from "./outcome";

const base = { matchId: "m", stageId: "st", shooterId: "sh", roId: "ro@example.fi", now: "2026-11-07T10:00:00.000Z" };

describe("buildDnfScore", () => {
  it("is a result with no time and no hits, and the chosen reason", () => {
    const score = buildDnfScore({ ...base, reason: "injury", existing: null });
    expect(score).toMatchObject({
      id: "st:sh", status: "dnf", dnfReason: "injury", timeSec: null, paper: [], steel: [],
      noShoots: 0, procedurals: 0, roId: "ro@example.fi", shooterAccepted: false,
      createdAt: base.now, updatedAt: base.now,
    });
    expect(score.dqReason).toBeUndefined();
  });

  it("accepts every DNF reason", () => {
    for (const reason of DNF_REASONS) expect(buildDnfScore({ ...base, reason, existing: null }).dnfReason).toBe(reason);
  });

  it("keeps createdAt when it replaces an earlier result", () => {
    const existing = { createdAt: "2026-11-07T09:00:00.000Z" } as StageScore;
    const score = buildDnfScore({ ...base, now: "2026-11-07T11:00:00.000Z", reason: "withdrew", existing });
    expect(score.createdAt).toBe("2026-11-07T09:00:00.000Z");
    expect(score.updatedAt).toBe("2026-11-07T11:00:00.000Z");
  });

  it("replaces a scored result when saved (the earlier hits are discarded)", async () => {
    const catalog = buildMockCatalog();
    const repo = createCatalogRepository(catalog, createMemoryScoreStore());
    const stageId = "autumn-2026-st3";
    const shooterId = "autumn-2026-sh10";
    await repo.saveScore({
      ...buildDnfScore({ ...base, matchId: "autumn-2026", stageId, shooterId, reason: "injury", existing: null }),
      status: "scored", timeSec: 8.42, paper: [["A", "A"]], dnfReason: undefined,
    });
    await repo.saveScore(buildDnfScore({ ...base, matchId: "autumn-2026", stageId, shooterId, reason: "injury", existing: null }));
    const saved = (await repo.getScore(stageId, shooterId))!;
    expect(saved).toMatchObject({ status: "dnf", timeSec: null, paper: [] });
  });
});

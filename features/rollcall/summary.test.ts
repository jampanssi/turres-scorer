import { describe, expect, it } from "vitest";
import { buildMockCatalog } from "@/shared/data/mock/catalog";
import { createCatalogRepository } from "@/shared/data/mock/repository";
import { buildMockScores } from "@/shared/data/mock/scores";
import { createMemoryScoreStore } from "@/shared/data/score-store";
import { attendanceId } from "@/shared/domain/ids";
import type { Attendance, Shooter } from "@/shared/domain/types";
import { buildRoster, loadRoster } from "./summary";

const shooters: Shooter[] = [1, 2, 3].map((n) => ({ id: `s${n}`, name: `Shooter ${n}`, competitorNumber: n }));
const rec = (shooterId: string, day: string, status: Attendance["status"]): Attendance => ({
  id: attendanceId(day, shooterId),
  matchId: "autumn-2026",
  shooterId,
  day,
  status,
  roId: "ro",
  updatedAt: `${day}T08:00:00.000Z`,
});

describe("buildRoster", () => {
  it("treats everyone as present unless their latest record says DNS", () => {
    const rows = buildRoster(shooters, [rec("s2", "2026-11-07", "dns")], new Set());
    expect(rows.map((r) => r.dns)).toEqual([false, true, false]);
  });

  it("lets a later record take the DNS back", () => {
    const rows = buildRoster(shooters, [rec("s1", "2026-11-07", "dns"), rec("s1", "2026-11-08", "present")], new Set());
    expect(rows[0].dns).toBe(false);
  });

  it("keeps a DNS mark from an earlier day until someone changes it", () => {
    expect(buildRoster(shooters, [rec("s1", "2026-11-06", "dns")], new Set())[0].dns).toBe(true);
  });

  it("moves shooters disqualified from the match to the end", () => {
    const rows = buildRoster(shooters, [], new Set(["s1"]));
    expect(rows.map((r) => r.shooter.id)).toEqual(["s2", "s3", "s1"]);
    expect(rows.map((r) => r.disqualified)).toEqual([false, false, true]);
  });

  it("marks shooters who have a result on any stage", () => {
    const rows = buildRoster(shooters, [], new Set(), new Set(["s2"]));
    expect(rows.map((r) => r.hasResults)).toEqual([false, true, false]);
  });
});

describe("loadRoster", () => {
  const catalog = buildMockCatalog();
  const MATCH = "autumn-2026";
  const squadsOfMatch = catalog.squads.filter((s) => s.matchId === MATCH);
  const NOW = "2026-11-07T10:00:00.000Z";
  const repo = (seed: Attendance[] = []) =>
    createCatalogRepository(catalog, createMemoryScoreStore(), buildMockScores(catalog), {
      now: () => NOW,
      seedAttendance: seed,
    });

  it("lists every squad of the match in order, with the match counts and today from the repository clock", async () => {
    const data = (await loadRoster(repo(), MATCH))!;
    expect(data.day).toBe("2026-11-07");
    expect(data.stageCount).toBe(6);
    expect(data.shooterCount).toBe(64);
    expect(data.squads.map((s) => s.squad.number)).toEqual(squadsOfMatch.map((s) => s.number).sort((a, b) => a - b));
    expect(data.squads[0].rows).toHaveLength(squadsOfMatch.find((s) => s.number === 1)!.shooterIds.length);
  });

  it("marks the shooters who are DNS", async () => {
    const dnsId = squadsOfMatch[0].shooterIds[0];
    const data = (await loadRoster(repo([rec(dnsId, "2026-11-07", "dns")]), MATCH))!;
    expect(
      data.squads
        .flatMap((s) => s.rows)
        .filter((r) => r.dns)
        .map((r) => r.shooter.id),
    ).toEqual([dnsId]);
  });

  it("returns null for an unknown match", async () => {
    expect(await loadRoster(repo(), "nope")).toBeNull();
  });
});

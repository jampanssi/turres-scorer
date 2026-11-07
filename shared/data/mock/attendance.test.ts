import { describe, expect, it, vi } from "vitest";
import { dayOf, dnsShooterIds } from "@/shared/domain/attendance";
import { attendanceId } from "@/shared/domain/ids";
import type { Attendance } from "@/shared/domain/types";
import { createMemoryAttendanceStore } from "../attendance-store";
import { createMemoryScoreStore } from "../score-store";
import { buildMockAttendance } from "./attendance";
import { buildMockCatalog } from "./catalog";
import { createCatalogRepository } from "./repository";

const MATCH = "autumn-2026";
const NOW = "2026-11-07T10:00:00.000Z";
const DAY = dayOf(NOW);
const catalog = buildMockCatalog();
const squad = (n: number) => catalog.squads.find((s) => s.matchId === MATCH && s.number === n)!;
const repo = (seed: Attendance[] = []) =>
  createCatalogRepository(catalog, createMemoryScoreStore(), [], {
    now: () => NOW,
    attendance: createMemoryAttendanceStore(),
    seedAttendance: seed,
  });

const rec = (shooterId: string, status: Attendance["status"], day = DAY): Attendance => ({
  id: attendanceId(day, shooterId),
  matchId: MATCH,
  shooterId,
  day,
  status,
  roId: "ro",
  updatedAt: NOW,
});

describe("repository roll call", () => {
  it("starts empty, saves records in one go and notifies once", async () => {
    const r = repo();
    const listener = vi.fn();
    r.subscribe(listener);
    expect(await r.listAttendance(MATCH)).toEqual([]);

    const [a, b] = squad(6).shooterIds;
    await r.saveAttendance([rec(a, "present"), rec(b, "dns")]);
    expect(listener).toHaveBeenCalledTimes(1);
    expect((await r.listAttendance(MATCH)).map((x) => x.status).sort()).toEqual(["dns", "present"]);
  });

  it("replaces a record saved again for the same shooter and day", async () => {
    const r = repo();
    const [a] = squad(6).shooterIds;
    await r.saveAttendance([rec(a, "dns")]);
    await r.saveAttendance([rec(a, "present")]);
    const all = await r.listAttendance(MATCH);
    expect(all).toHaveLength(1);
    expect(all[0].status).toBe("present");
  });

  it("lets a saved record override a seeded one", async () => {
    const [a] = squad(7).shooterIds;
    const r = repo([rec(a, "dns")]);
    expect(dnsShooterIds(await r.listAttendance(MATCH)).has(a)).toBe(true);
    await r.saveAttendance([rec(a, "present")]);
    expect(dnsShooterIds(await r.listAttendance(MATCH)).has(a)).toBe(false);
  });

  it("keeps the matches apart", async () => {
    const r = repo();
    await r.saveAttendance([rec(squad(6).shooterIds[0], "present")]);
    expect(await r.listAttendance("club-night-11")).toEqual([]);
  });
});

describe("sample roll call", () => {
  const seeds = buildMockAttendance(catalog, DAY, NOW);

  it("is a single DNS shooter in squad 7 of the live match, dated today", () => {
    expect(seeds).toHaveLength(1);
    expect(seeds[0]).toMatchObject({ matchId: MATCH, day: DAY, status: "dns" });
    expect(squad(7).shooterIds).toContain(seeds[0].shooterId);
    expect([...dnsShooterIds(seeds)]).toEqual([seeds[0].shooterId]);
  });
});

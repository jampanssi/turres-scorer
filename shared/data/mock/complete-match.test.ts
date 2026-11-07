import { describe, expect, it, vi } from "vitest";
import { dnfResult, scoredResult } from "@/shared/domain/test-fixtures";
import { attendanceId } from "@/shared/domain/ids";
import type { Attendance } from "@/shared/domain/types";
import { RepositoryError } from "../errors";
import { createMemoryMatchStore } from "../match-store";
import { createMemoryScoreStore } from "../score-store";
import { buildMockCatalog } from "./catalog";
import { createCatalogRepository } from "./repository";

const catalog = buildMockCatalog();
const LIVE = "autumn-2026";
const UPCOMING = "club-night-11";
const FINISHED = "club-night-10";
const NOW = "2026-11-07T15:00:00.000Z";
const squad = catalog.squads.find((s) => s.matchId === LIVE && s.number === 6)!;
const stage = catalog.stages.find((s) => s.matchId === LIVE && s.number === 1)!;

const repo = () =>
  createCatalogRepository(catalog, createMemoryScoreStore(), [], { now: () => NOW, matches: createMemoryMatchStore() });
const rec = (shooterId: string, matchId = LIVE): Attendance => ({
  id: attendanceId("2026-11-07", shooterId),
  matchId,
  shooterId,
  day: "2026-11-07",
  status: "dns",
  roId: "ro",
  updatedAt: NOW,
});
const refusal = async (action: Promise<unknown>) => {
  const error = await action.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(RepositoryError);
  return (error as RepositoryError).code;
};

describe("completing a match", () => {
  it("marks it finished with the visibility, the time from the repository clock and who did it", async () => {
    const r = repo();
    expect((await r.getMatch(LIVE))!.status).toBe("live");
    await r.completeMatch(LIVE, { visibility: "public", roId: "ro@example.fi" });
    expect(await r.getMatch(LIVE)).toMatchObject({
      status: "finished",
      resultsVisibility: "public",
      completedAt: NOW,
      completedBy: "ro@example.fi",
    });
  });

  it("shows up in the match list too, and leaves the other matches alone", async () => {
    const r = repo();
    await r.completeMatch(LIVE, { visibility: "organisers", roId: "ro" });
    const all = new Map((await r.listMatches()).map((m) => [m.id, m]));
    expect(all.get(LIVE)).toMatchObject({ status: "finished", resultsVisibility: "organisers" });
    expect(all.get(UPCOMING)!.status).toBe("open");
    expect(all.get(UPCOMING)!.resultsVisibility).toBeUndefined();
  });

  it("notifies subscribers once", async () => {
    const r = repo();
    const listener = vi.fn();
    r.subscribe(listener);
    await r.completeMatch(LIVE, { visibility: "participants", roId: "ro" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("is final: completing again, or an unknown or already finished match, is refused", async () => {
    const r = repo();
    await r.completeMatch(LIVE, { visibility: "participants", roId: "ro" });
    expect(await refusal(r.completeMatch(LIVE, { visibility: "public", roId: "ro" }))).toBe("matchCompleted");
    expect(await refusal(r.completeMatch(FINISHED, { visibility: "public", roId: "ro" }))).toBe("matchCompleted");
    expect(await refusal(r.completeMatch("nope", { visibility: "public", roId: "ro" }))).toBe("matchNotFound");
    expect((await r.getMatch(LIVE))!.resultsVisibility).toBe("participants"); // the first choice stays
  });
});

describe("a completed match is read only", () => {
  const score = () => scoredResult({ matchId: LIVE, stageId: stage.id, shooterId: squad.shooterIds[0] });

  it("accepts scores and roll call marks while the match is live", async () => {
    const r = repo();
    await r.saveScore(score());
    await r.saveAttendance([rec(squad.shooterIds[1])]);
    expect((await r.listScores(LIVE)).length).toBe(1);
    expect((await r.listAttendance(LIVE)).length).toBe(1);
  });

  it("refuses scores of every kind and roll call marks after completion, and stores nothing", async () => {
    const r = repo();
    await r.saveScore(score());
    await r.completeMatch(LIVE, { visibility: "participants", roId: "ro" });
    expect(await refusal(r.saveScore(score()))).toBe("matchCompleted");
    expect(
      await refusal(r.saveScore(dnfResult({ matchId: LIVE, stageId: stage.id, shooterId: squad.shooterIds[2] }))),
    ).toBe("matchCompleted");
    expect(await refusal(r.saveAttendance([rec(squad.shooterIds[1])]))).toBe("matchCompleted");
    expect((await r.listScores(LIVE)).length).toBe(1);
    expect(await r.listAttendance(LIVE)).toEqual([]);
  });

  it("does not notify subscribers when a change is refused", async () => {
    const r = repo();
    await r.completeMatch(LIVE, { visibility: "participants", roId: "ro" });
    const listener = vi.fn();
    r.subscribe(listener);
    await refusal(r.saveScore(score()));
    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps working for other matches", async () => {
    const r = repo();
    await r.completeMatch(LIVE, { visibility: "participants", roId: "ro" });
    const other = catalog.stages.find((s) => s.matchId === UPCOMING)!;
    await r.saveScore(scoredResult({ matchId: UPCOMING, stageId: other.id, shooterId: "someone" }));
    expect((await r.listScores(UPCOMING)).length).toBe(1);
  });

  it("the finished sample matches are read only from the start", async () => {
    const r = repo();
    const stageOfFinished = catalog.stages.find((s) => s.matchId === FINISHED)!;
    expect(
      await refusal(
        r.saveScore(scoredResult({ matchId: FINISHED, stageId: stageOfFinished.id, shooterId: "someone" })),
      ),
    ).toBe("matchCompleted");
  });
});

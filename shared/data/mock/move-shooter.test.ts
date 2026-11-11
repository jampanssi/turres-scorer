import { describe, expect, it, vi } from "vitest";
import { scoredResult } from "@/shared/domain/test-fixtures";
import { RepositoryError } from "../errors";
import { createMemoryScoreStore } from "../score-store";
import { buildMockCatalog } from "./catalog";
import { createCatalogRepository } from "./repository";

const catalog = buildMockCatalog();
const MATCH = "autumn-2026";
const squadOf = (n: number) => catalog.squads.find((s) => s.matchId === MATCH && s.number === n)!;
const [sq2, sq3] = [squadOf(2), squadOf(3)];
const repo = () => {
  let tick = 0;
  return createCatalogRepository(catalog, createMemoryScoreStore(), [], {
    now: () => new Date(Date.UTC(2026, 10, 7, 10, 0, tick++)).toISOString(),
  });
};
const refusal = async (action: Promise<unknown>) => {
  const error = await action.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(RepositoryError);
  return (error as RepositoryError).code;
};

describe("moving a shooter to another squad", () => {
  it("takes the shooter out of the old squad and puts them last in the new one", async () => {
    const r = repo();
    const mover = sq2.shooterIds[0];
    await r.moveShooter(mover, sq3.id, { roId: "ro" });
    const from = await r.getSquad(sq2.id);
    const to = await r.getSquad(sq3.id);
    expect(from!.shooterIds).toEqual(sq2.shooterIds.slice(1));
    expect(to!.shooterIds).toEqual([...sq3.shooterIds, mover]);
    expect((await r.listShooters(sq3.id)).at(-1)!.id).toBe(mover);
    expect((await r.listShooters(sq2.id)).map((s) => s.id)).not.toContain(mover);
  });

  it("is reflected in listSquads, in squad number order, and the catalog itself is not touched", async () => {
    const r = repo();
    await r.moveShooter(sq2.shooterIds[0], sq3.id, { roId: "ro" });
    const squads = await r.listSquads(MATCH);
    expect(squads.map((s) => s.number)).toEqual([...squads.map((s) => s.number)].sort((a, b) => a - b));
    expect(squads.find((s) => s.id === sq3.id)!.shooterIds).toHaveLength(sq3.shooterIds.length + 1);
    expect(sq2.shooterIds).toHaveLength(8); // the sample catalog is unchanged
  });

  it("refuses a shooter who already has a result on any stage, and moves the others", async () => {
    const r = repo();
    const [scored, other] = sq2.shooterIds;
    await r.saveScore(scoredResult({ matchId: MATCH, stageId: sq2.stageRotation[0], shooterId: scored }));
    expect(await refusal(r.moveShooter(scored, sq3.id, { roId: "ro" }))).toBe("shooterHasResults");
    expect((await r.getSquad(sq2.id))!.shooterIds).toContain(scored);
    await r.moveShooter(other, sq3.id, { roId: "ro" });
    expect((await r.getSquad(sq3.id))!.shooterIds).toContain(other);
  });

  it("puts several shooters at the end in the order they were moved, and moving back puts one last again", async () => {
    const r = repo();
    const [a, b] = sq2.shooterIds;
    await r.moveShooter(b, sq3.id, { roId: "ro" });
    await r.moveShooter(a, sq3.id, { roId: "ro" });
    expect((await r.getSquad(sq3.id))!.shooterIds.slice(-2)).toEqual([b, a]);
    await r.moveShooter(b, sq2.id, { roId: "ro" });
    expect((await r.getSquad(sq2.id))!.shooterIds.at(-1)).toBe(b);
    expect((await r.getSquad(sq3.id))!.shooterIds).not.toContain(b);
  });

  it("notifies subscribers once", async () => {
    const r = repo();
    const listener = vi.fn();
    r.subscribe(listener);
    await r.moveShooter(sq2.shooterIds[0], sq3.id, { roId: "ro" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("refuses an unknown shooter, an unknown squad and a move to the squad the shooter is already in", async () => {
    const r = repo();
    expect(await refusal(r.moveShooter("nope", sq3.id, { roId: "ro" }))).toBe("shooterNotFound");
    expect(await refusal(r.moveShooter(sq2.shooterIds[0], "nope", { roId: "ro" }))).toBe("squadNotFound");
    expect(await refusal(r.moveShooter(sq2.shooterIds[0], sq2.id, { roId: "ro" }))).toBe("sameSquad");
  });

  it("refuses a shooter of another match", async () => {
    const r = repo();
    const other = catalog.squads.find((s) => s.matchId === "club-night-11")!;
    expect(await refusal(r.moveShooter(sq2.shooterIds[0], other.id, { roId: "ro" }))).toBe("shooterNotFound");
  });

  it("refuses everything once the match is completed, and does not notify", async () => {
    const r = repo();
    await r.completeMatch(MATCH, { visibility: "participants", roId: "ro" });
    const listener = vi.fn();
    r.subscribe(listener);
    expect(await refusal(r.moveShooter(sq2.shooterIds[0], sq3.id, { roId: "ro" }))).toBe("matchCompleted");
    expect(listener).not.toHaveBeenCalled();
    expect((await r.getSquad(sq2.id))!.shooterIds).toEqual(sq2.shooterIds);
  });

  it("only affects its own match", async () => {
    const r = repo();
    await r.moveShooter(sq2.shooterIds[0], sq3.id, { roId: "ro" });
    const other = catalog.squads.filter((s) => s.matchId === "club-night-11");
    expect((await r.listSquads("club-night-11")).map((s) => s.shooterIds)).toEqual(other.map((s) => s.shooterIds));
  });
});

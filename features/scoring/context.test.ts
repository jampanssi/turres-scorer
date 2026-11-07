import { describe, expect, it } from "vitest";
import { buildMockCatalog } from "@/shared/data/mock/catalog";
import { createCatalogRepository } from "@/shared/data/mock/repository";
import { buildMockScores } from "@/shared/data/mock/scores";
import { createMemoryScoreStore } from "@/shared/data/score-store";
import { dqResult, scoredResult } from "@/shared/domain/test-fixtures";
import { loadScoringContext } from "./context";

const catalog = buildMockCatalog();
const repo = () => createCatalogRepository(catalog, createMemoryScoreStore(), buildMockScores(catalog));
const MATCH = "autumn-2026";
const squad2 = catalog.squads.find((s) => s.matchId === MATCH && s.number === 2)!;
const squad3 = catalog.squads.find((s) => s.matchId === MATCH && s.number === 3)!;

describe("loadScoringContext", () => {
  it("loads a shooter with no result yet", async () => {
    // Squad 2's 8th shooter on the squad's last stage: nothing saved there.
    const context = (await loadScoringContext(
      repo(),
      MATCH,
      squad2.id,
      squad2.stageRotation[5],
      squad2.shooterIds[7],
    ))!;
    expect(context.existing).toBeNull();
    expect(context.disqualified).toBe(false);
    expect(context.shooter.id).toBe(squad2.shooterIds[7]);
  });

  const empty = () => createCatalogRepository(catalog, createMemoryScoreStore(), []);

  it("offers the next shooter without a result: not the same one, not one already scored or disqualified", async () => {
    // The order the app lists the squad in (the shooting order).
    const [a, b, c, d] = (await empty().listShooters(squad2.id)).map((shooter) => shooter.id);
    const stageId = squad2.stageRotation[0];
    const nextFor = async (repository: ReturnType<typeof empty>, shooterId: string) =>
      (await loadScoringContext(repository, MATCH, squad2.id, stageId, shooterId))!.nextShooterId;

    expect(await nextFor(empty(), a)).toBe(b);

    const repository = empty();
    await repository.saveScore(scoredResult({ matchId: MATCH, stageId, shooterId: b }));
    await repository.saveScore(dqResult({ matchId: MATCH, stageId: squad2.stageRotation[1], shooterId: c }));
    expect(await nextFor(repository, a)).toBe(d); // b is scored here, c is disqualified in the match
  });

  it("loads the saved result so it can be corrected", async () => {
    const context = (await loadScoringContext(
      repo(),
      MATCH,
      squad2.id,
      squad2.stageRotation[0],
      squad2.shooterIds[0],
    ))!;
    expect(context.existing?.status).toBe("scored");
  });

  it("flags a shooter disqualified in the match, on any stage", async () => {
    const dqShooter = squad3.shooterIds[6];
    for (const stageId of squad3.stageRotation) {
      const context = (await loadScoringContext(repo(), MATCH, squad3.id, stageId, dqShooter))!;
      expect(context.disqualified).toBe(true);
    }
  });

  it("returns null for ids that do not belong together", async () => {
    const stage = squad2.stageRotation[0];
    const shooter = squad2.shooterIds[0];
    expect(await loadScoringContext(repo(), MATCH, "nope", stage, shooter)).toBeNull();
    expect(await loadScoringContext(repo(), MATCH, squad2.id, "nope", shooter)).toBeNull();
    expect(await loadScoringContext(repo(), MATCH, squad2.id, stage, "nope")).toBeNull();
    expect(await loadScoringContext(repo(), MATCH, squad2.id, stage, squad3.shooterIds[0])).toBeNull(); // other squad
    expect(await loadScoringContext(repo(), "club-night-11", squad2.id, stage, shooter)).toBeNull(); // other match
  });
});

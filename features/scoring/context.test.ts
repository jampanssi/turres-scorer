import { describe, expect, it } from "vitest";
import { buildMockCatalog } from "@/shared/data/mock";
import { createCatalogRepository } from "@/shared/data/mock-repository";
import { buildMockScores } from "@/shared/data/mock-scores";
import { createMemoryScoreStore } from "@/shared/data/score-store";
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

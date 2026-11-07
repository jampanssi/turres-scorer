import { describe, expect, it } from "vitest";
import { disqualifiedShooterIds } from "./disqualified";
import type { StageScore } from "./types";

const score = (shooterId: string, stageId: string, status: StageScore["status"]): StageScore => ({
  id: `${stageId}:${shooterId}`,
  matchId: "m",
  stageId,
  shooterId,
  roId: "ro",
  status,
  timeSec: null,
  paper: [],
  steel: [],
  noShoots: 0,
  procedurals: 0,
  shooterAccepted: false,
  createdAt: "",
  updatedAt: "",
});

describe("disqualifiedShooterIds", () => {
  it("collects shooters with a DQ result on any stage", () => {
    const ids = disqualifiedShooterIds([score("a", "s1", "scored"), score("a", "s2", "dq"), score("b", "s1", "dnf")]);
    expect([...ids]).toEqual(["a"]);
  });
  it("is empty when nobody is disqualified (a DNF is not a DQ)", () => {
    expect(disqualifiedShooterIds([score("a", "s1", "dnf"), score("b", "s1", "scored")]).size).toBe(0);
  });
});

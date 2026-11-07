import { describe, expect, it } from "vitest";
import { disqualifiedShooterIds } from "./disqualified";
import { dnfResult, dqResult, scoredResult } from "./test-fixtures";

const at = (shooterId: string, stageId: string) => ({ shooterId, stageId });

describe("disqualifiedShooterIds", () => {
  it("collects shooters with a DQ result on any stage", () => {
    const ids = disqualifiedShooterIds([
      scoredResult(at("a", "s1")),
      dqResult(at("a", "s2")),
      dnfResult(at("b", "s1")),
    ]);
    expect([...ids]).toEqual(["a"]);
  });
  it("is empty when nobody is disqualified (a DNF is not a DQ)", () => {
    expect(disqualifiedShooterIds([dnfResult(at("a", "s1")), scoredResult(at("b", "s1"))]).size).toBe(0);
  });
});

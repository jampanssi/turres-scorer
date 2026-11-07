import { describe, expect, it } from "vitest";
import { scoreId } from "./ids";
import {
  createResultIndex,
  expectedShooters,
  indexResults,
  matchProgress,
  squadProgress,
  stageProgress,
} from "./progress";
import type { StageScore } from "./types";

/** Results as `stage:shooter` ids; `dq` lists the shooters disqualified from the match. */
const index = (results: Array<[stage: string, shooter: string]>, dq: string[] = [], dns: string[] = []) =>
  createResultIndex(
    results.map(([stage, shooter]) => scoreId(stage, shooter)),
    dq,
    dns,
  );

const everyone = (stages: string[], shooters: string[]): Array<[string, string]> =>
  stages.flatMap((stage) => shooters.map((shooter): [string, string] => [stage, shooter]));

describe("who is expected on a stage", () => {
  const shooters = ["a", "b", "c"];

  it("is everyone when nobody is disqualified", () => {
    expect(expectedShooters("s1", shooters, index([]))).toEqual(["a", "b", "c"]);
  });

  it("leaves a disqualified shooter out, unless they have a result on that stage", () => {
    const dq = ["b"];
    expect(expectedShooters("s1", shooters, index([], dq))).toEqual(["a", "c"]);
    expect(expectedShooters("s1", shooters, index([["s1", "b"]], dq))).toEqual(["a", "b", "c"]);
  });
});

describe("a DQ over time: shooter b is disqualified on s2 (results on s1 and the DQ on s2, nothing on s3)", () => {
  const shooters = ["a", "b", "c"];
  const results: Array<[string, string]> = [
    ...everyone(["s1", "s2"], shooters), // b: scored on s1, DQ on s2
    ["s3", "a"],
    ["s3", "c"],
  ];
  const idx = index(results, ["b"]);

  it.each([
    ["before the DQ (s1)", "s1", { scored: 3, total: 3, status: "done" }],
    ["on the DQ stage (s2): the DQ counts as scored", "s2", { scored: 3, total: 3, status: "done" }],
    ["after the DQ (s3): b is not expected", "s3", { scored: 2, total: 2, status: "done" }],
  ])("%s", (_name, stage, expected) => {
    expect(stageProgress(stage, shooters, idx)).toEqual(expected);
  });

  it("an unfinished stage after the DQ still waits for the others", () => {
    const partial = index([...everyone(["s1", "s2"], shooters), ["s3", "a"]], ["b"]);
    expect(stageProgress("s3", shooters, partial)).toEqual({ scored: 1, total: 2, status: "inProgress" });
  });
});

describe("stageProgress", () => {
  const shooters = ["a", "b"];
  it("not started, in progress, done", () => {
    expect(stageProgress("s1", shooters, index([])).status).toBe("notStarted");
    expect(stageProgress("s1", shooters, index([["s1", "a"]])).status).toBe("inProgress");
    expect(stageProgress("s1", shooters, index(everyone(["s1"], shooters))).status).toBe("done");
  });
  it("a stage with nobody on it is not done", () => {
    expect(stageProgress("s1", [], index([]))).toEqual({ scored: 0, total: 0, status: "notStarted" });
  });
  it("ignores results of other shooters and other stages", () => {
    expect(
      stageProgress(
        "s1",
        shooters,
        index([
          ["s1", "z"],
          ["s2", "a"],
        ]),
      ).scored,
    ).toBe(0);
  });
});

describe("squadProgress", () => {
  const shooters = ["a", "b"];
  const stages = ["s2", "s3", "s1"]; // the squad's rotation

  it("not started", () => {
    expect(squadProgress(shooters, stages, index([]))).toEqual({
      stagesDone: 0,
      stagesTotal: 3,
      currentStageId: "s2",
      status: "notStarted",
    });
  });

  it("on range: the current stage is the first unfinished one in rotation order", () => {
    const idx = index([...everyone(["s2"], shooters), ["s3", "a"]]);
    expect(squadProgress(shooters, stages, idx)).toEqual({
      stagesDone: 1,
      stagesTotal: 3,
      currentStageId: "s3",
      status: "onRange",
    });
  });

  it("done: every stage done, no current stage", () => {
    const idx = index(everyone(stages, shooters));
    expect(squadProgress(shooters, stages, idx)).toEqual({
      stagesDone: 3,
      stagesTotal: 3,
      currentStageId: null,
      status: "done",
    });
  });

  it("does not wait for a disqualified shooter on the stages after the DQ", () => {
    const idx = index([...everyone(stages, ["a"]), ["s2", "b"]], ["b"]); // b: only the DQ result on s2
    expect(squadProgress(shooters, stages, idx).status).toBe("done");
  });

  it("a squad with no stages is not started", () => {
    expect(squadProgress(shooters, [], index([])).status).toBe("notStarted");
  });
});

describe("matchProgress", () => {
  const squads = [{ shooterIds: ["a", "b", "c"] }, { shooterIds: ["d", "e"] }];
  const stages = ["s1", "s2"];

  it("counts every shooter on every stage", () => {
    expect(matchProgress(squads, stages, index([]))).toEqual({ scored: 0, total: 10 });
  });

  it("counts results of expected shooters", () => {
    const idx = index([
      ["s1", "a"],
      ["s2", "a"],
      ["s1", "d"],
    ]);
    expect(matchProgress(squads, stages, idx)).toEqual({ scored: 3, total: 10 });
  });

  it("a DQ counts on its own stage and earlier ones, and later stages leave the total", () => {
    // b: scored on s1, DQ on s2 -> 2 results kept; a DQ on the last stage removes nothing later.
    const idx = index(
      [
        ["s1", "b"],
        ["s2", "b"],
      ],
      ["b"],
    );
    expect(matchProgress(squads, stages, idx)).toEqual({ scored: 2, total: 10 });
    // c disqualified on s1: s1 stays expected (result), s2 drops out -> total 9.
    const early = index([["s1", "c"]], ["c"]);
    expect(matchProgress(squads, stages, early)).toEqual({ scored: 1, total: 9 });
  });

  it("ignores results of shooters who are in no squad", () => {
    expect(matchProgress(squads, stages, index([["s1", "stranger"]])).scored).toBe(0);
  });
});

describe("indexResults", () => {
  const result = (stageId: string, shooterId: string, status: StageScore["status"]) =>
    ({ stageId, shooterId, status }) as StageScore;

  it("finds results by stage and shooter, and collects the disqualified", () => {
    const idx = indexResults([result("s1", "a", "scored"), result("s2", "a", "dq"), result("s1", "b", "dnf")]);
    expect(idx.has("s1", "a")).toBe(true);
    expect(idx.has("s1", "b")).toBe(true);
    expect(idx.has("s2", "b")).toBe(false);
    expect([...idx.disqualified]).toEqual(["a"]);
  });
});

describe("a DNS shooter (did not show at roll call)", () => {
  const shooters = ["a", "b", "c"];

  it("is not expected on any stage, so they do not hold up progress", () => {
    const idx = index(everyone(["s1"], ["a", "c"]), [], ["b"]);
    expect(expectedShooters("s1", shooters, idx)).toEqual(["a", "c"]);
    expect(stageProgress("s1", shooters, idx)).toEqual({ scored: 2, total: 2, status: "done" });
    expect(squadProgress(shooters, ["s1", "s2"], index(everyone(["s1", "s2"], ["a", "c"]), [], ["b"])).status).toBe(
      "done",
    );
  });

  it("is expected again once the DNS is reversed", () => {
    const results = everyone(["s1"], ["a", "c"]);
    expect(stageProgress("s1", shooters, index(results, [], ["b"])).status).toBe("done");
    expect(stageProgress("s1", shooters, index(results)).status).toBe("inProgress"); // b is here after all
  });

  it("still counts on a stage where they already have a result", () => {
    const idx = index(everyone(["s1"], shooters), [], ["b"]);
    expect(expectedShooters("s1", shooters, idx)).toEqual(["a", "b", "c"]);
    expect(expectedShooters("s2", shooters, idx)).toEqual(["a", "c"]);
  });

  it("is handled together with a DQ", () => {
    const idx = index([["s1", "a"]], ["a"], ["b"]);
    expect(expectedShooters("s2", shooters, idx)).toEqual(["c"]);
    expect(expectedShooters("s1", shooters, idx)).toEqual(["a", "c"]);
  });

  it("matchProgress leaves the DNS shooter out of the totals", () => {
    const squads = [{ shooterIds: shooters }];
    expect(matchProgress(squads, ["s1", "s2"], index([], [], ["b"])).total).toBe(4);
  });

  it("indexResults reads DNS from the roll call records, latest day first", () => {
    const rec = (shooterId: string, day: string, status: "present" | "dns") => ({
      id: day + shooterId,
      matchId: "m",
      shooterId,
      day,
      status,
      roId: "ro",
      updatedAt: day,
    });
    const idx = indexResults(
      [],
      [rec("a", "2026-11-07", "dns"), rec("b", "2026-11-07", "dns"), rec("b", "2026-11-08", "present")],
    );
    expect([...idx.notStarting]).toEqual(["a"]);
  });
});

import { describe, expect, it } from "vitest";
import { canCompleteMatch, DEFAULT_RESULTS_VISIBILITY, isCompleted, visibilityOf } from "./match-state";
import { RESULTS_VISIBILITIES } from "./types";

describe("match state", () => {
  it("a match is completed only when it is finished", () => {
    expect(isCompleted({ status: "finished" })).toBe(true);
    expect(isCompleted({ status: "live" })).toBe(false);
    expect(isCompleted({ status: "open" })).toBe(false);
  });

  it("uses the stored visibility, or participants when none was stored", () => {
    expect(DEFAULT_RESULTS_VISIBILITY).toBe("participants");
    expect(visibilityOf({})).toBe("participants");
    expect(visibilityOf({ resultsVisibility: "public" })).toBe("public");
  });

  it("offers exactly the three visibilities, and the default is one of them", () => {
    expect([...RESULTS_VISIBILITIES]).toEqual(["public", "participants", "organisers"]);
    expect(RESULTS_VISIBILITIES).toContain(DEFAULT_RESULTS_VISIBILITY);
  });

  it("can be completed only when every stage is done", () => {
    const done = { status: "done", total: 8 } as const;
    expect(canCompleteMatch([done, done])).toBe(true);
    expect(canCompleteMatch([done, { status: "inProgress", total: 8 }])).toBe(false);
    expect(canCompleteMatch([done, { status: "notStarted", total: 8 }])).toBe(false);
  });

  it("does not wait for a stage nobody is expected on, and never completes a match without stages", () => {
    expect(
      canCompleteMatch([
        { status: "done", total: 8 },
        { status: "notStarted", total: 0 },
      ]),
    ).toBe(true);
    expect(canCompleteMatch([])).toBe(false);
  });
});

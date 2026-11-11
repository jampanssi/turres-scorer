import { describe, expect, it } from "vitest";
import { applySquadMoves, squadOf } from "./squad-moves";
import type { Squad, SquadMove } from "./types";

const squad = (id: string, number: number, shooterIds: string[]): Squad => ({
  id,
  matchId: "m",
  number,
  shooterIds,
  stageRotation: [],
});
const move = (shooterId: string, squadId: string, movedAt = "2026-11-07T10:00:00.000Z"): SquadMove => ({
  shooterId,
  matchId: "m",
  squadId,
  movedAt,
  movedBy: "ro",
});

const squads = [squad("s1", 1, ["a", "b", "c"]), squad("s2", 2, ["d", "e"]), squad("s3", 3, [])];
const ids = (list: Squad[]) => list.map((s) => s.shooterIds);

describe("applySquadMoves", () => {
  it("changes nothing without moves, and does not change the squads it was given", () => {
    expect(ids(applySquadMoves(squads, []))).toEqual([["a", "b", "c"], ["d", "e"], []]);
    applySquadMoves(squads, [move("a", "s2")]);
    expect(squads[0].shooterIds).toEqual(["a", "b", "c"]);
  });

  it("takes the shooter out of their squad and puts them at the end of the chosen one", () => {
    expect(ids(applySquadMoves(squads, [move("a", "s2")]))).toEqual([["b", "c"], ["d", "e", "a"], []]);
    expect(ids(applySquadMoves(squads, [move("c", "s3")]))).toEqual([["a", "b"], ["d", "e"], ["c"]]);
  });

  it("puts several shooters in the order they were moved, whatever order the records come in", () => {
    const moves = [move("b", "s2", "2026-11-07T10:05:00.000Z"), move("a", "s2", "2026-11-07T10:01:00.000Z")];
    expect(ids(applySquadMoves(squads, moves))[1]).toEqual(["d", "e", "a", "b"]);
  });

  it("moving back to the original squad puts the shooter at the end of it, not at their old place", () => {
    expect(ids(applySquadMoves(squads, [move("a", "s1")]))[0]).toEqual(["b", "c", "a"]);
  });

  it("ignores a move to a squad that does not exist: the shooter stays", () => {
    expect(ids(applySquadMoves(squads, [move("a", "nope")]))).toEqual([["a", "b", "c"], ["d", "e"], []]);
  });

  it("ignores a move of a shooter nobody has, without adding them to the target", () => {
    expect(ids(applySquadMoves(squads, [move("ghost", "s2")]))[1]).toEqual(["d", "e", "ghost"]); // listed, as the record says
  });
});

describe("squadOf", () => {
  it("finds the squad a shooter is in, or null", () => {
    expect(squadOf(squads, "e")?.id).toBe("s2");
    expect(squadOf(squads, "zzz")).toBeNull();
    expect(squadOf(applySquadMoves(squads, [move("e", "s3")]), "e")?.id).toBe("s3");
  });
});

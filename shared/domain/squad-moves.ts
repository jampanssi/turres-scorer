import type { Squad, SquadMove } from "./types";

/**
 * Moving a shooter to another squad. Pure functions, no React.
 *
 * A move takes the shooter out of their squad for the **whole match** and puts them at the **end** of the
 * chosen squad's shooting order. Results already saved stay with the shooter (a result belongs to a
 * shooter and a stage, not to a squad), so nothing is lost. A shooter has at most one move: moving again
 * replaces it, and moving back to the original squad puts them at the end of that squad too.
 */

/**
 * The squads of a match with the moves laid over them. Moves are applied oldest first, so shooters moved
 * into the same squad end up in the order they were moved. A move to a squad that is not in the list is
 * ignored (the shooter stays where they were).
 */
export function applySquadMoves(squads: readonly Squad[], moves: readonly SquadMove[]): Squad[] {
  const result = squads.map((squad) => ({ ...squad, shooterIds: [...squad.shooterIds] }));
  const ordered = [...moves].sort(
    (a, b) => a.movedAt.localeCompare(b.movedAt) || a.shooterId.localeCompare(b.shooterId),
  );
  for (const move of ordered) {
    const target = result.find((squad) => squad.id === move.squadId);
    if (!target) continue;
    for (const squad of result) squad.shooterIds = squad.shooterIds.filter((id) => id !== move.shooterId);
    target.shooterIds.push(move.shooterId);
  }
  return result;
}

/** The squad a shooter is in, or null if none of the squads has them. */
export function squadOf(squads: readonly Squad[], shooterId: string): Squad | null {
  return squads.find((squad) => squad.shooterIds.includes(shooterId)) ?? null;
}

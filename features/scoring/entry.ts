import type { HitCode, SteelHit } from "@/shared/domain/types";

/** Matrix entry behaviour, see docs/SCORING.md. Pure functions, no React. */

export const STEEL_HITS_REQUIRED = 1;

/**
 * A steel target starts as a hit (`A`): the range officer only has to tap the ones that were missed. A steel
 * row is therefore never empty on the Scoring screen.
 */
export const DEFAULT_STEEL_HIT = "A" satisfies Exclude<SteelHit, null>;

/**
 * Add a tap to a paper row. A row holds `required` hits (the stage's hits per paper target, 1-3).
 * - While the row has room, the hit is added.
 * - On a full row the tap **replaces a hit that differs**: the oldest entry that is not the tapped code is
 *   dropped and the tapped code is added. So `AC` + A gives `AA` in one tap (a plain "drop the oldest"
 *   would give `CA`, the same hits again, and the correction would take a second tap). Tapping a code the
 *   whole row already holds changes nothing.
 * The order of a row never matters for the score, only which codes it holds.
 */
export function addPaperHit(row: HitCode[], hit: HitCode, required: number): HitCode[] {
  if (row.length < required) return [...row, hit];
  const oldestDifferent = row.findIndex((entry) => entry !== hit);
  if (oldestDifferent === -1) return row.slice(-required); // every entry is already this code
  return [...row.slice(0, oldestDifferent), ...row.slice(oldestDifferent + 1), hit].slice(-required);
}

/** Remove the most recent entry of a paper row. */
export function undoPaperHit(row: HitCode[]): HitCode[] {
  return row.slice(0, -1);
}

/** Tapping a steel cell sets it to that value (the other is cleared). */
export function setSteelHit(hit: Exclude<SteelHit, null>): SteelHit {
  return hit;
}

/** Undo on a steel row puts it back to where it started: the default hit, `A`. */
export function undoSteelHit(): SteelHit {
  return DEFAULT_STEEL_HIT;
}

/** How many entries a paper row still needs ("N left"). 0 = complete. */
export function paperRemaining(row: HitCode[], required: number): number {
  return Math.max(0, required - row.length);
}

export function steelRemaining(hit: SteelHit): number {
  return hit === null ? STEEL_HITS_REQUIRED : 0;
}

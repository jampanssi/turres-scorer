import type { HitCode, SteelHit } from "@/shared/domain/types";

/** Matrix entry behaviour, see docs/SCORING.md. Pure functions, no React. */

export const STEEL_HITS_REQUIRED = 1;

/**
 * A steel target starts as a hit (`A`): the range officer only has to tap the ones that were missed. A steel
 * row is therefore never empty on the Scoring screen.
 */
export const DEFAULT_STEEL_HIT = "A" satisfies Exclude<SteelHit, null>;

/**
 * Add a tap to a paper row. A row holds `required` hits (the stage's hits per paper target, 1-3):
 * it keeps the most recent taps (FIFO), dropping the oldest.
 */
export function addPaperHit(row: HitCode[], hit: HitCode, required: number): HitCode[] {
  const next = [...row, hit];
  return next.length > required ? next.slice(next.length - required) : next;
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

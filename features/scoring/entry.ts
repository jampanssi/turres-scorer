import type { HitCode, SteelHit } from "@/shared/domain/types";

/** Matrix entry behaviour, see docs/SCORING.md. Pure functions, no React. */

export const STEEL_HITS_REQUIRED = 1;

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

/** Undo on a steel row clears it. */
export function undoSteelHit(): SteelHit {
  return null;
}

/** How many entries a paper row still needs ("N left"). 0 = complete. */
export function paperRemaining(row: HitCode[], required: number): number {
  return Math.max(0, required - row.length);
}

export function steelRemaining(hit: SteelHit): number {
  return hit === null ? STEEL_HITS_REQUIRED : 0;
}

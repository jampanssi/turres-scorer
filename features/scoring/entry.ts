import type { HitCode, SteelHit } from "@/shared/domain/types";

/** Matrix entry behaviour, see docs/SCORING.md. Pure functions, no React. */

export const PAPER_HITS_REQUIRED = 2;
export const STEEL_HITS_REQUIRED = 1;

/** Add a tap to a paper row. Keeps the two most recent taps (FIFO). */
export function addPaperHit(row: HitCode[], hit: HitCode): HitCode[] {
  const next = [...row, hit];
  return next.length > PAPER_HITS_REQUIRED ? next.slice(next.length - PAPER_HITS_REQUIRED) : next;
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

/** How many entries a row still needs ("N left"). 0 = complete. */
export function paperRemaining(row: HitCode[]): number {
  return Math.max(0, PAPER_HITS_REQUIRED - row.length);
}

export function steelRemaining(hit: SteelHit): number {
  return hit === null ? STEEL_HITS_REQUIRED : 0;
}

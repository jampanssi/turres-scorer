import type { HitCode, SteelHit } from "@/shared/domain/types";

/** Pure scoring rules, see docs/SCORING.md. No React or UI imports. */

export const HIT_POINTS = { A: 5, C: 3, D: 1 } as const;
export const PENALTY_POINTS = 10;

export interface Totals {
  A: number;
  C: number;
  D: number;
  M: number;
  NS: number;
  PE: number;
}

export interface ScoreInput {
  paper: HitCode[][];
  steel: SteelHit[];
  noShoots: number;
  procedurals: number;
}

/** Count hits per code. Steel A/M count like paper A/M. */
export function totalsOf(input: ScoreInput): Totals {
  const totals: Totals = { A: 0, C: 0, D: 0, M: 0, NS: input.noShoots, PE: input.procedurals };
  for (const row of input.paper) for (const hit of row) totals[hit] += 1;
  for (const hit of input.steel) if (hit) totals[hit] += 1;
  return totals;
}

/** Stage points, never negative. */
export function pointsOf(t: Totals): number {
  const raw =
    HIT_POINTS.A * t.A +
    HIT_POINTS.C * t.C +
    HIT_POINTS.D * t.D -
    PENALTY_POINTS * (t.M + t.NS + t.PE);
  return Math.max(0, raw);
}

/** Hit factor = points / time. 0 if time is empty or not positive. */
export function hitFactor(points: number, timeSec: number | null): number {
  if (timeSec === null || !(timeSec > 0)) return 0;
  return points / timeSec;
}

/** Maximum no-shoot hits: 2 per no-shoot target. */
export function maxNoShoots(noShootTargets: number): number {
  return noShootTargets * 2;
}

/** Maximum procedurals: ceil(maxPoints / 10); 8 procedurals guarantee a zero stage in the example. */
export function maxProcedurals(paperTargets: number, steelTargets: number): number {
  const maxPoints = paperTargets * 2 * HIT_POINTS.A + steelTargets * HIT_POINTS.A;
  return Math.ceil(maxPoints / PENALTY_POINTS);
}

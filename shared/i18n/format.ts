/** Display formatting: `.` decimal separator, HF 4 decimals, time 2 decimals, Finnish dates (`7.11` or `7.11.2026`). */

export function formatHitFactor(hf: number): string {
  return hf.toFixed(4);
}

export function formatTime(sec: number): string {
  return `${sec.toFixed(2)} s`;
}

/** Parse time input; accepts `.` or `,` as the decimal separator. Returns null if empty or invalid. */
export function parseTime(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Short Finnish date without year, e.g. "7.11" (UTC, so the day does not shift by timezone). */
export function formatMatchDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()}.${d.getUTCMonth() + 1}`;
}

/** Finnish date with year, e.g. "7.11.2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.${d.getUTCFullYear()}`;
}

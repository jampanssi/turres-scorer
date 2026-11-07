import type { Attendance, AttendanceStatus } from "./types";

/**
 * Roll call rules. Pure functions, no React.
 *
 * - Everyone is **present** unless marked otherwise: the only action in the app is marking a shooter
 *   **DNS** (did not show), and taking that back. Taking it back saves a "present" record.
 * - A shooter is **not starting** (DNS) when their latest record, by day, says so. A mark stays until
 *   someone changes it, on this day or a later one, so a shooter who was DNS yesterday and is here
 *   today is set back to present. Who counts for progress is decided in `progress.ts`, which uses
 *   `dnsShooterIds`.
 * - Records carry the calendar day they were made (in the match's time zone, fixed to Europe/Helsinki
 *   until match data carries its own), so the latest one can be found.
 */

const TIME_ZONE = "Europe/Helsinki";

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** The calendar day of an ISO timestamp in the match's time zone: "2026-11-07". */
export function dayOf(iso: string): string {
  return dayFormat.format(new Date(iso)); // en-CA formats as YYYY-MM-DD
}

/** The newest record of each shooter (latest day; the later `updatedAt` if the same day twice). */
function latestRecords(records: readonly Attendance[]): Map<string, Attendance> {
  const latest = new Map<string, Attendance>();
  for (const record of records) {
    const current = latest.get(record.shooterId);
    const newer =
      !current || record.day > current.day || (record.day === current.day && record.updatedAt > current.updatedAt);
    if (newer) latest.set(record.shooterId, record);
  }
  return latest;
}

/** The status a shooter's latest record gives them, or null when they were never marked (present). */
export function latestStatus(records: readonly Attendance[], shooterId: string): AttendanceStatus | null {
  return latestRecords(records).get(shooterId)?.status ?? null;
}

/** Shooters whose latest record says DNS: they are not starting. */
export function dnsShooterIds(records: readonly Attendance[]): Set<string> {
  return new Set([...latestRecords(records)].filter(([, r]) => r.status === "dns").map(([id]) => id));
}

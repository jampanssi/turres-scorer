import { attendanceId } from "@/shared/domain/ids";
import type { Attendance } from "@/shared/domain/types";
import type { Catalog } from "./catalog";

/**
 * Sample roll call for the live match, dated `day` (today): everyone is present by default, so the
 * only record is one shooter marked DNS (squad 7, third shooter; the squad has not started yet).
 * Read-only seed data: a saved record with the same id overrides it. Replaced by SSI data later.
 * Deterministic.
 */
const MATCH_ID = "autumn-2026";
const DNS = { squad: 7, shooterIndex: 2 };

export function buildMockAttendance(catalog: Catalog, day: string, updatedAt: string): Attendance[] {
  const squad = catalog.squads.find((s) => s.matchId === MATCH_ID && s.number === DNS.squad);
  const shooterId = squad?.shooterIds[DNS.shooterIndex];
  if (!shooterId) return [];
  return [
    { id: attendanceId(day, shooterId), matchId: MATCH_ID, shooterId, day, status: "dns", roId: "ro-1", updatedAt },
  ];
}

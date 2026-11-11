import { dayOf } from "@/shared/domain/attendance";
import { attendanceId } from "@/shared/domain/ids";
import type { Attendance } from "@/shared/domain/types";
import { getRepository } from "./index";

/**
 * Mark a shooter DNS (`dns: true`) or take the mark back (a "present" record), for today unless `day` is given.
 * Used by the Shooters tab and by the actions on a shooter in the shooting order, so both write the same record.
 * Throws if the repository refuses (for example a completed match).
 */
export async function saveShooterDns(params: {
  matchId: string;
  shooterId: string;
  dns: boolean;
  roId: string;
  day?: string;
}): Promise<void> {
  const repo = await getRepository();
  const updatedAt = repo.now();
  const day = params.day ?? dayOf(updatedAt);
  const record: Attendance = {
    id: attendanceId(day, params.shooterId),
    matchId: params.matchId,
    shooterId: params.shooterId,
    day,
    status: params.dns ? "dns" : "present",
    roId: params.roId,
    updatedAt,
  };
  await repo.saveAttendance([record]);
}

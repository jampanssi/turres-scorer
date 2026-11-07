import type { Attendance } from "@/shared/domain/types";

/** Local persistence for roll call records. IndexedDB in the browser, in-memory for tests and non-browser use. */
export interface AttendanceStore {
  /** Insert or replace records (by id) in one go, so "Mark all present" is a single write. */
  putMany(records: Attendance[]): Promise<void>;
  listByMatch(matchId: string): Promise<Attendance[]>;
}

export function createMemoryAttendanceStore(): AttendanceStore {
  const records = new Map<string, Attendance>();
  return {
    async putMany(batch) {
      for (const record of batch) records.set(record.id, structuredClone(record));
    },
    async listByMatch(matchId) {
      return [...records.values()].filter((r) => r.matchId === matchId).map((r) => structuredClone(r));
    },
  };
}

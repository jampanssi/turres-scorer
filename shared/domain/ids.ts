/**
 * The id of a saved result. There is at most one result per shooter per stage, so the id is derived
 * from both. This is the only place that knows the format.
 */
export function scoreId(stageId: string, shooterId: string): string {
  return `${stageId}:${shooterId}`;
}

/** The id of a roll call record: one per shooter per day. The only place that knows the format. */
export function attendanceId(day: string, shooterId: string): string {
  return `${day}:${shooterId}`;
}

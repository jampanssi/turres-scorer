import { describe, expect, it } from "vitest";
import { dayOf, dnsShooterIds, latestStatus } from "./attendance";
import { attendanceId } from "./ids";
import type { Attendance, AttendanceStatus } from "./types";

const record = (
  shooterId: string,
  day: string,
  status: AttendanceStatus,
  updatedAt = `${day}T08:00:00.000Z`,
): Attendance => ({
  id: attendanceId(day, shooterId),
  matchId: "m",
  shooterId,
  day,
  status,
  roId: "ro",
  updatedAt,
});

describe("dayOf", () => {
  it("gives the calendar day in Finland, not in UTC", () => {
    expect(dayOf("2026-11-07T10:00:00.000Z")).toBe("2026-11-07");
    // 23:30 UTC on 7 Nov is 01:30 on 8 Nov in Finland (UTC+2 in winter)
    expect(dayOf("2026-11-07T23:30:00.000Z")).toBe("2026-11-08");
    // 21:30 UTC is still 7 Nov at 23:30 in winter, but already 8 Nov at 00:30 in summer (UTC+3)
    expect(dayOf("2026-11-07T21:30:00.000Z")).toBe("2026-11-07");
    expect(dayOf("2026-07-07T21:30:00.000Z")).toBe("2026-07-08");
  });

  it("follows the daylight saving change at the end of October", () => {
    expect(dayOf("2026-10-24T21:30:00.000Z")).toBe("2026-10-25"); // still summer time: 00:30
    expect(dayOf("2026-10-25T21:30:00.000Z")).toBe("2026-10-25"); // winter time: 23:30
  });
});

describe("latestStatus", () => {
  const records = [
    record("a", "2026-11-07", "dns"),
    record("a", "2026-11-08", "present"),
    record("b", "2026-11-07", "present"),
  ];

  it("uses the latest day: a later day overrides an earlier one", () => {
    expect(latestStatus(records, "a")).toBe("present");
    expect(latestStatus(records, "b")).toBe("present");
  });

  it("is null for a shooter who was never marked (present by default)", () => {
    expect(latestStatus(records, "c")).toBeNull();
  });

  it("uses the later update when the same day was saved twice", () => {
    const twice = [
      record("a", "2026-11-07", "dns", "2026-11-07T09:00:00.000Z"),
      record("a", "2026-11-07", "present", "2026-11-07T10:00:00.000Z"),
    ];
    expect(latestStatus(twice, "a")).toBe("present");
  });
});

describe("dnsShooterIds", () => {
  it("lists shooters whose latest roll call is DNS", () => {
    const records = [
      record("a", "2026-11-07", "dns"),
      record("b", "2026-11-07", "dns"),
      record("b", "2026-11-08", "present"), // came back the next day
      record("c", "2026-11-07", "present"),
      record("c", "2026-11-08", "dns"), // left the next day
    ];
    expect([...dnsShooterIds(records)].sort()).toEqual(["a", "c"]);
  });
});

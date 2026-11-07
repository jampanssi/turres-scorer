import type { TFn } from "./translate";

/** The header subtitle of a match view: "6 stages · 8 squads · 64 shooters". Squads and Shooters share it. */
export function formatMatchCounts(counts: { stages: number; squads: number; shooters: number }, t: TFn): string {
  return [
    t("common.stageCount", { count: counts.stages }),
    t("common.squadCount", { count: counts.squads }),
    t("common.shooterCount", { count: counts.shooters }),
  ].join(" · ");
}

import type { Stage } from "@/shared/domain/types";
import type { TFn } from "./translate";

/** "6 paper · 3 steel · 2 no-shoots": parts with a count of 0 are left out. */
export function formatStageTargets(stage: Stage, t: TFn): string {
  return [
    stage.paperTargets > 0 && t("common.paperCount", { count: stage.paperTargets }),
    stage.steelTargets > 0 && t("common.steelCount", { count: stage.steelTargets }),
    stage.noShootTargets > 0 && t("common.noShootCount", { count: stage.noShootTargets }),
  ]
    .filter(Boolean)
    .join(" · ");
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getRepository } from "@/shared/data";
import { hitFactor, pointsOf, totalsOf } from "@/shared/domain/scoring";
import type { Shooter, StageScore } from "@/shared/domain/types";
import { formatHitFactor, formatTime } from "@/shared/i18n/format";
import type { TFn } from "@/shared/i18n/translate";
import { useT } from "@/shared/i18n/useT";
import { showToast } from "@/shared/ui/toast";

interface SaveTarget {
  /** The shooter list: where to go after saving. */
  backHref: string;
  shooter: Pick<Shooter, "id" | "name">;
}

/**
 * Saving a result from the scoring screen: build it with the repository's clock, store it, show a
 * confirmation toast, then go back to the shooter list. `saving` stays true until the page has
 * changed, so a result cannot be saved twice; if storing fails, `saveFailed` is set and the sheet
 * stays open to try again.
 */
export function useSaveResult({ backHref, shooter }: SaveTarget) {
  const router = useRouter();
  const { t } = useT();
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  /** `build` receives the current time: the repository is the source of time, not the component. */
  async function persist(build: (now: string) => StageScore) {
    setSaving(true);
    setSaveFailed(false);
    try {
      const repo = await getRepository();
      const score = build(repo.now());
      await repo.saveScore(score);
      showToast({ ...confirmation(score, shooter.name, t), shooterId: shooter.id });
      // replace, not push: Back from the shooter list must not reopen the score page just saved.
      router.replace(backHref);
    } catch {
      setSaving(false);
      setSaveFailed(true);
    }
  }

  return { saving, saveFailed, persist, clearFailure: () => setSaveFailed(false) };
}

/** The title and message of the confirmation toast for a saved result. */
function confirmation(score: StageScore, name: string, t: TFn): { title: string; message: string } {
  switch (score.status) {
    case "scored":
      return {
        title: t("toast.savedTitle"),
        message: t("toast.saved", {
          name,
          time: formatTime(score.timeSec),
          hf: formatHitFactor(hitFactor(pointsOf(totalsOf(score)), score.timeSec)),
        }),
      };
    case "dnf":
      return { title: t("toast.dnfTitle"), message: t("toast.dnf", { name }) };
    case "dq":
      return { title: t("toast.dqTitle"), message: t("toast.dq", { name }) };
  }
}

"use client";

import { useState } from "react";
import { useCurrentUser } from "@/features/shell/SessionGate";
import { getRepository } from "@/shared/data";
import type { ResultsVisibility } from "@/shared/domain/types";
import { useT } from "@/shared/i18n/useT";
import { showToast } from "@/shared/ui/toast";

/**
 * Completing a match from the Stages screen. `saving` is true while the repository call runs; if it
 * fails, `failed` is set and the sheet stays open to try again. On success the repository notifies
 * subscribers, so the screen refreshes by itself, and a toast confirms it.
 */
export function useCompleteMatch(matchId: string, onDone: () => void) {
  const { t } = useT();
  const user = useCurrentUser();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  async function complete(visibility: ResultsVisibility) {
    setSaving(true);
    setFailed(false);
    try {
      const repo = await getRepository();
      await repo.completeMatch(matchId, { visibility, roId: user.userId });
      showToast({ message: t("match.completed") });
      onDone();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return { complete, saving, failed, clearFailure: () => setFailed(false) };
}

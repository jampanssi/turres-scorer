"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getRepository } from "@/shared/data";
import type { StageScore } from "@/shared/domain/types";

/**
 * Saving a result from the scoring screen: build it with the repository's clock, store it, then go
 * back to the shooter list. `saving` stays true until the page has changed, so a result cannot be
 * saved twice; if storing fails, `saveFailed` is set and the sheet stays open to try again.
 */
export function useSaveResult(backHref: string) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  /** `build` receives the current time: the repository is the source of time, not the component. */
  async function persist(build: (now: string) => StageScore) {
    setSaving(true);
    setSaveFailed(false);
    try {
      const repo = await getRepository();
      await repo.saveScore(build(repo.now()));
      router.push(backHref);
    } catch {
      setSaving(false);
      setSaveFailed(true);
    }
  }

  return { saving, saveFailed, persist, clearFailure: () => setSaveFailed(false) };
}

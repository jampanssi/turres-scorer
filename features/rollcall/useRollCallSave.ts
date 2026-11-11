"use client";

import { useState } from "react";
import { saveShooterDns } from "@/shared/data/attendance-save";

/**
 * Marking a shooter DNS, or taking the mark back (a "present" record). Every tap is saved at once,
 * so leaving the screen never loses anything.
 *
 * - `pending` holds taps that are not on screen from the repository yet, so a button looks pressed
 *   the moment it is tapped; the screen drops an entry once the data has caught up (`settle`).
 * - `failed` is set when a write failed, until the next one succeeds; that tap is taken back.
 */
export function useRollCallSave(matchId: string, day: string, roId: string) {
  const [pending, setPending] = useState<Readonly<Record<string, boolean>>>({});
  const [failed, setFailed] = useState(false);

  /** Mark a shooter DNS (`true`) or present again (`false`). */
  async function setDns(shooterId: string, dns: boolean) {
    setPending((p) => ({ ...p, [shooterId]: dns }));
    try {
      await saveShooterDns({ matchId, shooterId, dns, roId, day });
      setFailed(false);
    } catch {
      setFailed(true);
      setPending((p) => Object.fromEntries(Object.entries(p).filter(([id]) => id !== shooterId)));
    }
  }

  /** Drop pending taps that the loaded data already shows. Call it whenever the data changes. */
  function settle(current: ReadonlyMap<string, boolean>) {
    setPending((p) => {
      const rest = Object.entries(p).filter(([id, dns]) => current.get(id) !== dns);
      return rest.length === Object.keys(p).length ? p : Object.fromEntries(rest);
    });
  }

  return { setDns, settle, pending, failed };
}

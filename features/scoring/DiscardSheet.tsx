"use client";

import { useT } from "@/shared/i18n/useT";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Button } from "@/shared/ui/Button";

/** Asks before leaving the Scoring screen with an entry that has not been saved. Render it only while open. */
export function DiscardSheet({ onKeep, onDiscard }: { onKeep: () => void; onDiscard: () => void }) {
  const { t } = useT();
  return (
    <BottomSheet
      open
      tone="surface"
      onClose={onKeep}
      title={t("discard.title")}
      actions={
        <>
          <Button variant="outlinePrimary" className="flex-1" onClick={onKeep}>
            {t("discard.keep")}
          </Button>
          <Button variant="dangerSolid" className="flex-1" onClick={onDiscard}>
            {t("discard.confirm")}
          </Button>
        </>
      }
    >
      <p className="text-base">{t("discard.info")}</p>
    </BottomSheet>
  );
}

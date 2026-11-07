"use client";

import { useState } from "react";
import { useT } from "@/shared/i18n/useT";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/form";
import type { ScoreDraft } from "./draft";
import type { ReviewSummary } from "./review";
import { ScoreSummary, SummaryCard } from "./ScoreSummary";

interface ReviewSheetProps {
  /** The shooter line under the title: "Antti Mäkelä · #23 · Stage 3 · Squad 2". */
  subtitle: string;
  draft: ScoreDraft;
  hitsPerPaperTarget: number;
  summary: ReviewSummary;
  /** Edit: close the sheet and go back to scoring. */
  onEdit: () => void;
  /** Accept & save: called once the shooter has accepted. */
  onAccept: () => void;
  saving: boolean;
  saveFailed: boolean;
}

/**
 * Shows the entered score before it is saved: the summary (time, points and hit factor, hit totals,
 * hits per target) and the shooter's sign-off. Render it only while open: the checkbox starts
 * unticked each time.
 */
export function ReviewSheet({
  subtitle,
  draft,
  hitsPerPaperTarget,
  summary,
  onEdit,
  onAccept,
  saving,
  saveFailed,
}: ReviewSheetProps) {
  const { t } = useT();
  const [accepted, setAccepted] = useState(false);
  const canSave = accepted && summary.complete && !saving;

  return (
    <BottomSheet
      open
      onClose={() => !saving && onEdit()}
      title={t("review.title")}
      subtitle={subtitle}
      actions={
        <>
          <Button variant="outlinePrimary" disabled={saving} onClick={onEdit}>
            {t("review.edit")}
          </Button>
          <Button className="flex-1" disabled={!canSave} onClick={onAccept}>
            {saving ? t("common.saving") : t("review.save")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2.5">
        <ScoreSummary draft={draft} hitsPerPaperTarget={hitsPerPaperTarget} summary={summary} />

        <SummaryCard title={t("review.signOff")}>
          <Checkbox
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            label={t("review.accept")}
          />
        </SummaryCard>

        {(summary.missingTime || summary.incompleteTargets > 0 || saveFailed) && (
          <div
            role="alert"
            className="flex flex-col gap-1 rounded-input bg-danger-tint px-3 py-2 text-sm font-semibold text-danger-text"
          >
            {summary.missingTime && <p>{t("review.issue.missingTime")}</p>}
            {summary.incompleteTargets > 0 && (
              <p>{t("review.issue.incompleteTargets", { count: summary.incompleteTargets })}</p>
            )}
            {saveFailed && <p>{t("common.saveError")}</p>}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

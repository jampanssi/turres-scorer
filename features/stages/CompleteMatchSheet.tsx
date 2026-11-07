"use client";

import { useState } from "react";
import { DEFAULT_RESULTS_VISIBILITY } from "@/shared/domain/match-state";
import { RESULTS_VISIBILITIES, type ResultsVisibility } from "@/shared/domain/types";
import { useT } from "@/shared/i18n/useT";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Button } from "@/shared/ui/Button";
import { WarningIcon } from "@/shared/ui/icons";
import { RadioGroup } from "@/shared/ui/form";

interface CompleteMatchSheetProps {
  /** The match name, under the title. */
  subtitle: string;
  onCancel: () => void;
  onConfirm: (visibility: ResultsVisibility) => void;
  saving: boolean;
  saveFailed: boolean;
}

/**
 * Confirms completing the match and asks who may see the results. Completing is final in the app and
 * locks scoring, so the sheet says so. The button that opens it is only enabled once every stage is done.
 * Render it only while open: the
 * choice starts on the default each time.
 */
export function CompleteMatchSheet({ subtitle, onCancel, onConfirm, saving, saveFailed }: CompleteMatchSheetProps) {
  const { t, tEnum } = useT();
  const [visibility, setVisibility] = useState<ResultsVisibility>(DEFAULT_RESULTS_VISIBILITY);

  return (
    <BottomSheet
      open
      tone="surface"
      onClose={() => !saving && onCancel()}
      title={t("match.complete.title")}
      subtitle={subtitle}
      icon={
        <span className="flex size-touch items-center justify-center rounded-full bg-primary-tint text-primary-text">
          <WarningIcon />
        </span>
      }
      actions={
        <>
          <Button variant="outline" className="flex-1" disabled={saving} onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button className="flex-[1.4]" disabled={saving} onClick={() => onConfirm(visibility)}>
            {saving ? t("common.saving") : t("match.complete.confirm")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="rounded-input bg-bg px-3.5 py-3 text-base text-text-label">{t("match.complete.info")}</p>

        <RadioGroup<ResultsVisibility>
          legend={t("match.complete.visibility")}
          name="results-visibility"
          value={visibility}
          onChange={setVisibility}
          disabled={saving}
          options={RESULTS_VISIBILITIES.map((value) => ({
            value,
            label: tEnum("match.visibility", value),
            hint: tEnum("match.visibilityHint", value),
          }))}
        />

        {saveFailed && (
          <p role="alert" className="rounded-input bg-danger-tint px-3 py-2 text-sm font-semibold text-danger-text">
            {t("common.saveError")}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}

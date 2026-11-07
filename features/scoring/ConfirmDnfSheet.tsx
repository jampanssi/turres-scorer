"use client";

import { useId, useState } from "react";
import { DNF_REASONS, type DnfReason } from "@/shared/domain/types";
import { useT } from "@/shared/i18n/useT";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Button } from "@/shared/ui/Button";
import { CircleXIcon } from "@/shared/ui/icons";

interface ConfirmDnfSheetProps {
  /** The shooter line under the title: "Antti Mäkelä · #23 · Stage 3". */
  subtitle: string;
  /** "Stage 3", used in the info text. */
  stageLabel: string;
  onCancel: () => void;
  onConfirm: (reason: DnfReason) => void;
  saving: boolean;
  saveFailed: boolean;
}

/**
 * Asks for a reason and confirms a DNF (did not finish) for this stage. Render it only while open:
 * the reason starts on the first choice each time.
 */
export function ConfirmDnfSheet({
  subtitle,
  stageLabel,
  onCancel,
  onConfirm,
  saving,
  saveFailed,
}: ConfirmDnfSheetProps) {
  const { t } = useT();
  const selectId = useId();
  const [reason, setReason] = useState<DnfReason>(DNF_REASONS[0]);

  return (
    <BottomSheet
      open
      tone="surface"
      onClose={() => !saving && onCancel()}
      title={t("dnf.title")}
      subtitle={subtitle}
      icon={
        <span className="flex size-11 items-center justify-center rounded-full bg-primary-tint text-primary-text">
          <CircleXIcon />
        </span>
      }
      actions={
        <>
          <Button variant="outline" className="flex-1" disabled={saving} onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button className="flex-[1.4]" disabled={saving} onClick={() => onConfirm(reason)}>
            {saving ? t("common.saving") : t("dnf.confirm")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="rounded-input bg-bg px-3.5 py-3 text-base text-text-label">
          {t("dnf.info", { stage: stageLabel })}
        </p>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={selectId} className="text-sm font-bold text-text-label">
            {t("dnf.reason")}
          </label>
          <select
            id={selectId}
            value={reason}
            onChange={(event) => setReason(event.target.value as DnfReason)}
            className="h-[50px] rounded-input border-[1.5px] border-border bg-surface px-3 text-base text-text"
          >
            {DNF_REASONS.map((code) => (
              <option key={code} value={code}>
                {t(`reason.dnf.${code}` as const)}
              </option>
            ))}
          </select>
        </div>

        {saveFailed && (
          <p role="alert" className="rounded-input bg-danger-tint px-3 py-2 text-sm font-semibold text-danger-text">
            {t("common.saveError")}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}

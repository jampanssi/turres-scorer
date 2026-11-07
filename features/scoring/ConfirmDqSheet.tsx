"use client";

import { useId, useState } from "react";
import { DQ_REASONS, type DqReason } from "@/shared/domain/types";
import { useT } from "@/shared/i18n/useT";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Button } from "@/shared/ui/Button";
import { WarningIcon } from "@/shared/ui/icons";

const MAX_NOTE_LENGTH = 500;

interface ConfirmDqSheetProps {
  /** The shooter line under the title: "Antti Mäkelä · #23 · Stage 3". */
  subtitle: string;
  onCancel: () => void;
  onConfirm: (reason: DqReason, note: string) => void;
  saving: boolean;
  saveFailed: boolean;
}

/**
 * Asks for a reason (and an optional note) and confirms a disqualification. A DQ removes the shooter
 * from the rest of the match. Render it only while open: the form starts fresh each time.
 */
export function ConfirmDqSheet({ subtitle, onCancel, onConfirm, saving, saveFailed }: ConfirmDqSheetProps) {
  const { t } = useT();
  const selectId = useId();
  const noteId = useId();
  const [reason, setReason] = useState<DqReason>(DQ_REASONS[0]);
  const [note, setNote] = useState("");

  return (
    <BottomSheet
      open
      tone="surface"
      onClose={() => !saving && onCancel()}
      title={t("dq.title")}
      subtitle={subtitle}
      icon={
        <span className="flex size-11 items-center justify-center rounded-full bg-danger-tint text-danger-fg">
          <WarningIcon />
        </span>
      }
      actions={
        <>
          <Button variant="outline" className="flex-1" disabled={saving} onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button variant="dangerSolid" className="flex-[1.4]" disabled={saving} onClick={() => onConfirm(reason, note)}>
            {saving ? t("common.saving") : t("dq.confirm")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="rounded-input bg-danger-tint px-3.5 py-3 text-base text-danger-text">{t("dq.info")}</p>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={selectId} className="text-sm font-bold text-text-label">
            {t("dq.reason")}
          </label>
          <select
            id={selectId}
            value={reason}
            onChange={(event) => setReason(event.target.value as DqReason)}
            className="h-[50px] rounded-input border-[1.5px] border-border bg-surface px-3 text-base text-text"
          >
            {DQ_REASONS.map((code) => (
              <option key={code} value={code}>
                {t(`reason.dq.${code}` as const)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={noteId} className="text-sm font-semibold text-text-label">
            {t("dq.note")}
          </label>
          <textarea
            id={noteId}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            maxLength={MAX_NOTE_LENGTH}
            className="resize-none rounded-input border-[1.5px] border-border bg-surface px-3 py-2.5 text-[15px] text-text"
          />
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

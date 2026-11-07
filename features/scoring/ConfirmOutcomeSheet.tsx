"use client";

import { type ReactNode, useState } from "react";
import { useT } from "@/shared/i18n/useT";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Button } from "@/shared/ui/Button";
import { cx } from "@/shared/ui/cx";
import { Field, Select, TextArea } from "@/shared/ui/form";

/** How the sheet looks: "primary" (blue, DNF) or "danger" (red, DQ). */
type Tone = "primary" | "danger";

const BADGE: Record<Tone, string> = {
  primary: "bg-primary-tint text-primary-text",
  danger: "bg-danger-tint text-danger-fg",
};
const INFO: Record<Tone, string> = {
  primary: "bg-bg text-text-label",
  danger: "bg-danger-tint text-danger-text",
};

interface ConfirmOutcomeSheetProps<Reason extends string> {
  tone: Tone;
  icon: ReactNode;
  title: string;
  /** The shooter line under the title: "Antti Mäkelä · #23 · Stage 3". */
  subtitle: string;
  /** The box that explains what confirming does. */
  info: string;
  reasonLabel: string;
  /** The reason codes, in the order shown; the first one is selected to begin with. */
  reasons: readonly Reason[];
  reasonText: (reason: Reason) => string;
  /** Add an optional free-text note (DQ). */
  note?: { label: string; maxLength: number };
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: (reason: Reason, note: string) => void;
  saving: boolean;
  saveFailed: boolean;
}

/**
 * The sheet that confirms ending a stage early (DNF) or disqualifying a shooter (DQ): an explanation,
 * a reason, an optional note, Cancel and Confirm. Render it only while open: the form starts fresh each time.
 * `ConfirmDnfSheet` and `ConfirmDqSheet` only choose the texts and the tone.
 */
export function ConfirmOutcomeSheet<Reason extends string>({
  tone,
  icon,
  title,
  subtitle,
  info,
  reasonLabel,
  reasons,
  reasonText,
  note,
  confirmLabel,
  onCancel,
  onConfirm,
  saving,
  saveFailed,
}: ConfirmOutcomeSheetProps<Reason>) {
  const { t } = useT();
  const [reason, setReason] = useState<Reason>(reasons[0]);
  const [noteText, setNoteText] = useState("");

  return (
    <BottomSheet
      open
      tone="surface"
      onClose={() => !saving && onCancel()}
      title={title}
      subtitle={subtitle}
      icon={<span className={cx("flex size-touch items-center justify-center rounded-full", BADGE[tone])}>{icon}</span>}
      actions={
        <>
          <Button variant="outline" className="flex-1" disabled={saving} onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button
            variant={tone === "danger" ? "dangerSolid" : "primary"}
            className="flex-[1.4]"
            disabled={saving}
            onClick={() => onConfirm(reason, noteText)}
          >
            {saving ? t("common.saving") : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className={cx("rounded-input px-3.5 py-3 text-base", INFO[tone])}>{info}</p>

        <Field label={reasonLabel}>
          {(control) => (
            <Select {...control} value={reason} onChange={(event) => setReason(event.target.value as Reason)}>
              {reasons.map((code) => (
                <option key={code} value={code}>
                  {reasonText(code)}
                </option>
              ))}
            </Select>
          )}
        </Field>

        {note && (
          <Field label={note.label} optional>
            {(control) => (
              <TextArea
                {...control}
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                rows={2}
                maxLength={note.maxLength}
              />
            )}
          </Field>
        )}

        {saveFailed && (
          <p role="alert" className="rounded-input bg-danger-tint px-3 py-2 text-sm font-semibold text-danger-text">
            {t("common.saveError")}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}

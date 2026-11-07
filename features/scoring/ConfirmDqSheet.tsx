"use client";

import { DQ_REASONS, type DqReason } from "@/shared/domain/types";
import { useT } from "@/shared/i18n/useT";
import { WarningIcon } from "@/shared/ui/icons";
import { ConfirmOutcomeSheet } from "./ConfirmOutcomeSheet";

const MAX_NOTE_LENGTH = 500;

interface ConfirmDqSheetProps {
  /** The shooter line under the title: "Antti Mäkelä · #23 · Stage 3". */
  subtitle: string;
  onCancel: () => void;
  onConfirm: (reason: DqReason, note: string) => void;
  saving: boolean;
  saveFailed: boolean;
}

/** Confirms a disqualification: pick a reason, add an optional note. A DQ lasts for the rest of the match. */
export function ConfirmDqSheet({ subtitle, onCancel, onConfirm, saving, saveFailed }: ConfirmDqSheetProps) {
  const { t, tEnum } = useT();
  return (
    <ConfirmOutcomeSheet<DqReason>
      tone="danger"
      icon={<WarningIcon />}
      title={t("dq.title")}
      subtitle={subtitle}
      info={t("dq.info")}
      reasonLabel={t("common.reason")}
      reasons={DQ_REASONS}
      reasonText={(reason) => tEnum("reason.dq", reason)}
      note={{ label: t("dq.note"), maxLength: MAX_NOTE_LENGTH }}
      confirmLabel={t("dq.confirm")}
      onCancel={onCancel}
      onConfirm={onConfirm}
      saving={saving}
      saveFailed={saveFailed}
    />
  );
}

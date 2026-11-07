"use client";

import { DNF_REASONS, type DnfReason } from "@/shared/domain/types";
import { useT } from "@/shared/i18n/useT";
import { CircleXIcon } from "@/shared/ui/icons";
import { ConfirmOutcomeSheet } from "./ConfirmOutcomeSheet";

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

/** Confirms a DNF (did not finish) for this stage: pick a reason. Hits entered on the stage are discarded. */
export function ConfirmDnfSheet({
  subtitle,
  stageLabel,
  onCancel,
  onConfirm,
  saving,
  saveFailed,
}: ConfirmDnfSheetProps) {
  const { t, tEnum } = useT();
  return (
    <ConfirmOutcomeSheet<DnfReason>
      tone="primary"
      icon={<CircleXIcon />}
      title={t("dnf.title")}
      subtitle={subtitle}
      info={t("dnf.info", { stage: stageLabel })}
      reasonLabel={t("common.reason")}
      reasons={DNF_REASONS}
      reasonText={(reason) => tEnum("reason.dnf", reason)}
      confirmLabel={t("dnf.confirm")}
      onCancel={onCancel}
      onConfirm={(reason) => onConfirm(reason)}
      saving={saving}
      saveFailed={saveFailed}
    />
  );
}

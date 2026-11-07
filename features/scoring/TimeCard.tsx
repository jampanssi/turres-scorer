"use client";

import { useId, useState } from "react";
import { useT } from "@/shared/i18n/useT";
import { Card } from "@/shared/ui/Card";
import { StopwatchIcon } from "@/shared/ui/icons";
import { formatTimeDigits } from "./draft";
import { TimeKeypad } from "./TimeKeypad";

interface TimeCardProps {
  /** The typed digits (see ScoreDraft.timeDigits). */
  digits: string;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

/**
 * The time field. It is a button that opens the number pad instead of the phone's keyboard,
 * so the keyboard never covers the matrix.
 */
export function TimeCard({ digits, onDigit, onBackspace, onClear }: TimeCardProps) {
  const { t } = useT();
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const display = formatTimeDigits(digits);

  return (
    <>
      <Card className="flex items-center gap-3 p-3">
        <StopwatchIcon className="shrink-0 text-primary-text" />
        <span id={labelId} className="flex-1 text-base font-bold">
          {t("score.time")}
        </span>
        <button
          type="button"
          aria-label={`${t("score.time")}: ${display || "0.00"}`}
          aria-haspopup="dialog"
          aria-describedby={labelId}
          onClick={() => setOpen(true)}
          className="h-[46px] w-[120px] rounded-input border-2 border-primary bg-surface px-3 text-right font-display text-[28px] font-bold text-text"
        >
          {display || <span className="text-disabled">0.00</span>}
        </button>
      </Card>
      <TimeKeypad
        open={open}
        onClose={() => setOpen(false)}
        digits={digits}
        onDigit={onDigit}
        onBackspace={onBackspace}
        onClear={onClear}
      />
    </>
  );
}

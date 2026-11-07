"use client";

import { useEffect } from "react";
import { useT } from "@/shared/i18n/useT";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { cx } from "@/shared/ui/cx";
import { BackspaceIcon } from "@/shared/ui/icons";
import { formatTimeDigits } from "./draft";

interface TimeKeypadProps {
  open: boolean;
  onClose: () => void;
  /** The typed digits (see ScoreDraft.timeDigits): the last two are decimals. */
  digits: string;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const KEY =
  "flex h-16 items-center justify-center rounded-button border-2 border-border bg-surface font-display text-[32px] font-bold text-text active:bg-surface-muted";

/**
 * Number pad for the time, in a bottom sheet: digits 0-9 and backspace. There is no decimal key:
 * the last two digits are the decimals, so 8, 4, 2 gives 8.42. On a keyboard, digits, Backspace and
 * Enter work too. (Escape and a tap outside also close the sheet.)
 */
export function TimeKeypad({ open, onClose, digits, onDigit, onBackspace, onClear }: TimeKeypadProps) {
  const { t } = useT();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (/^[0-9]$/.test(event.key)) onDigit(event.key);
      else if (event.key === "Backspace") onBackspace();
      else if (event.key === "Enter") onClose();
      else return;
      event.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onDigit, onBackspace, onClose]);

  const display = formatTimeDigits(digits);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t("score.time")}
      actions={
        <Button className="flex-1" onClick={onClose}>
          {t("keypad.done")}
        </Button>
      }
    >
      <Card className="px-4 py-3 text-center">
        <output
          aria-live="polite"
          className={`block font-display text-[48px] font-bold leading-none ${display ? "text-text" : "text-disabled"}`}
        >
          {display || "0.00"}
        </output>
        <p className="mt-2 text-xs text-text-secondary">{t("keypad.hint")}</p>
      </Card>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <button key={digit} type="button" className={KEY} onClick={() => onDigit(digit)}>
            {digit}
          </button>
        ))}
        <button
          type="button"
          aria-label={t("keypad.clear")}
          className={cx(KEY, "text-text-secondary")}
          onClick={onClear}
        >
          C
        </button>
        <button type="button" className={KEY} onClick={() => onDigit("0")}>
          0
        </button>
        <button type="button" aria-label={t("keypad.backspace")} className={KEY} onClick={onBackspace}>
          <BackspaceIcon width={30} height={30} />
        </button>
      </div>
    </BottomSheet>
  );
}

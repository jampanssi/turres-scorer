"use client";

import { useId } from "react";
import { useT } from "@/shared/i18n/useT";
import { StopwatchIcon } from "@/shared/ui/icons";
import { sanitizeTimeInput } from "./draft";

/** Time input: decimal keypad, accepts `.` or `,`, at most two decimals. */
export function TimeCard({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useT();
  const id = useId();

  return (
    <div className="flex items-center gap-3 rounded-card bg-surface p-3 shadow-card">
      <StopwatchIcon className="shrink-0 text-primary-text" />
      <label htmlFor={id} className="flex-1 text-base font-bold">
        {t("score.time")}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(sanitizeTimeInput(event.target.value))}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        className="h-[46px] w-[120px] rounded-input border-2 border-primary bg-surface px-3 text-right font-display text-[28px] font-bold text-text placeholder:text-disabled"
      />
    </div>
  );
}

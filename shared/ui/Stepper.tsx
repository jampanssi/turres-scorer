"use client";

import { useT } from "@/shared/i18n/useT";
import { IconButton } from "./IconButton";
import { MinusIcon, PlusIcon } from "./icons";

interface StepperProps {
  /** Already translated by the caller. */
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}

/** Label + `Max N`, then − count +. The + button is disabled at the maximum. */
export function Stepper({ label, value, max, onChange }: StepperProps) {
  const { t } = useT();
  const atMax = value >= max;
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold leading-tight">{label}</p>
        <p className="text-xs text-text-secondary">{t("stepper.max", { max })}</p>
      </div>
      <IconButton
        variant="outline"
        label={t("stepper.decrease", { label })}
        disabled={value <= 0}
        onClick={() => onChange(value - 1)}
      >
        <MinusIcon />
      </IconButton>
      <output aria-label={t("stepper.count", { label })} className="w-8 text-center font-display text-2xl font-bold">
        {value}
      </output>
      <IconButton
        variant="solid"
        label={t("stepper.increase", { label })}
        disabled={atMax}
        onClick={() => onChange(value + 1)}
      >
        <PlusIcon />
      </IconButton>
    </div>
  );
}

import { cx } from "./cx";
import { MinusIcon, PlusIcon } from "./icons";

interface StepperProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}

/** Label + `Max N`, then − count +. The + button is disabled at the maximum. */
export function Stepper({ label, value, max, onChange }: StepperProps) {
  const atMax = value >= max;
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold leading-tight">{label}</p>
        <p className="text-xs text-text-secondary">Max {max}</p>
      </div>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= 0}
        onClick={() => onChange(value - 1)}
        className="flex size-11 items-center justify-center rounded-button border-2 border-border bg-surface text-text-label disabled:text-disabled"
      >
        <MinusIcon />
      </button>
      <output aria-label={`${label} count`} className="w-8 text-center font-display text-2xl font-bold">
        {value}
      </output>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={atMax}
        onClick={() => onChange(value + 1)}
        className={cx(
          "flex size-11 items-center justify-center rounded-button text-white",
          atMax ? "cursor-not-allowed bg-disabled" : "bg-primary",
        )}
      >
        <PlusIcon />
      </button>
    </div>
  );
}

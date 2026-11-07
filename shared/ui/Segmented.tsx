import { cx } from "./cx";

interface SegmentedProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
}

/** Segmented control (Matches: Open | Results): a white track with the selected option filled blue. */
export function Segmented<T extends string>({ options, value, onChange, label }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex rounded-button bg-surface p-1 shadow-card">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cx(
              "h-10 flex-1 rounded-[8px] font-display text-lg font-bold uppercase tracking-wide",
              selected ? "bg-primary text-white" : "text-text-label",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

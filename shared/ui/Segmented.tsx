import { cx } from "./cx";

interface SegmentedProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
}

/** Segmented control for the blue header (Matches: Open | Results). */
export function Segmented<T extends string>({ options, value, onChange, label }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex rounded-button bg-primary-dark p-1">
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
              selected ? "bg-white text-primary" : "text-on-primary-muted",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

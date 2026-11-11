"use client";

import {
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useId,
} from "react";
import { cx } from "./cx";

const CONTROL = "rounded-input border-[1.5px] border-border bg-surface text-text";

interface FieldProps {
  label: string;
  /** An optional field has a lighter label. */
  optional?: boolean;
  /** Id of a message that describes this field (for example the form's error), set as aria-describedby. */
  describedBy?: string;
  /** Render the control with the props given: `{(control) => <TextInput {...control} name="email" />}`. */
  children: (control: { id: string; "aria-describedby"?: string }) => ReactNode;
}

/** A label tied to its control (same id), so a tap on the label focuses it and screen readers announce it. */
export function Field({ label, optional, describedBy, children }: FieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cx("text-sm text-text-label", optional ? "font-semibold" : "font-bold")}>
        {label}
      </label>
      {children({ id, "aria-describedby": describedBy })}
    </div>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        CONTROL,
        "h-[50px] w-full px-4 text-base placeholder:text-disabled aria-invalid:border-danger-fg",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(CONTROL, "h-[50px] w-full px-3 text-base", className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(CONTROL, "w-full resize-none px-3 py-2.5 text-[15px]", className)} {...props} />;
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label: ReactNode;
}

/** A checkbox with its label on the right; the whole row is the tap target (44 px tall). */
export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="flex min-h-touch items-center gap-2.5 text-sm">
      <input type="checkbox" className="size-[22px] shrink-0 accent-primary" {...props} />
      {label}
    </label>
  );
}

interface RadioGroupProps<T extends string> {
  /** The group's visible name (a `legend`), read out with each option. */
  legend: string;
  /** Radios of one group share this name; it only has to differ from other groups on the page. */
  name: string;
  options: ReadonlyArray<{ value: T; label: string; hint?: string }>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/**
 * A group of native radio buttons, so arrow keys move the choice and a screen reader reads "n of m".
 * Each row is at least 44 px tall and the whole row is the tap target; the selected row is outlined,
 * so the choice is never shown by colour alone.
 */
export function RadioGroup<T extends string>({ legend, name, options, value, onChange, disabled }: RadioGroupProps<T>) {
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-bold text-text-label">{legend}</legend>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <label
            key={option.value}
            className={cx(
              "flex min-h-touch items-start gap-3 rounded-input border-2 px-3 py-2.5",
              selected ? "border-primary bg-primary-tint" : "border-border bg-surface",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="mt-0.5 size-[22px] shrink-0 accent-primary"
            />
            <span className="flex flex-col">
              <span className="text-base font-bold">{option.label}</span>
              {option.hint && <span className="text-[13px] text-text-secondary">{option.hint}</span>}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

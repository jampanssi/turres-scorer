import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "outline" | "outlinePrimary" | "dangerOutline" | "dangerSolid";

/**
 * Every button is the same pill: 48 px tall, fully rounded, Inter 15 px semibold, normal case, no icons.
 * Outlines are 1 px and transparent; a fill is the only thing that makes a button louder.
 */
const BASE =
  "inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-full px-5 font-sans text-[15px] font-semibold tracking-[0.1px] transition-colors disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  /** The main action: blue fill (Review, Confirm DNF, Done, Sign in). */
  primary: "bg-primary text-white hover:bg-primary-hover disabled:bg-disabled",
  /** The neutral choice: grey outline, blue text (DNF, Cancel, Edit). */
  outline: "border border-neutral-outline text-primary-text disabled:border-disabled disabled:text-disabled",
  /** An outline that points at the main action: blue outline (Edit in Review, Keep editing). */
  outlinePrimary: "border border-primary text-primary-text disabled:border-disabled disabled:text-disabled",
  /** The destructive choice: red outline and text (DQ). */
  dangerOutline: "border border-destructive-fg text-destructive-fg disabled:border-disabled disabled:text-disabled",
  /** The destructive action: red fill (Confirm DQ, Discard). */
  dangerSolid: "bg-destructive text-white disabled:bg-disabled",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cx(BASE, VARIANTS[variant], className)} {...props} />;
}

/** A link that looks like a button (a real <a>, not a button that navigates). */
export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={cx(BASE, VARIANTS[variant], className)} {...props} />;
}

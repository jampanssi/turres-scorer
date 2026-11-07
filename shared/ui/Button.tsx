import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "outline" | "outlinePrimary" | "dangerOutline" | "dangerSolid";

const BASE =
  "inline-flex min-h-13 items-center justify-center gap-2 rounded-button px-5 font-display text-xl font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover disabled:bg-disabled",
  outline: "border-2 border-border bg-surface text-text-label disabled:text-disabled",
  outlinePrimary: "border-2 border-primary bg-surface text-primary-text disabled:border-disabled disabled:text-disabled",
  dangerOutline: "border-2 border-danger-fg bg-surface text-danger-fg disabled:border-disabled disabled:text-disabled",
  dangerSolid: "bg-danger text-white disabled:bg-disabled",
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

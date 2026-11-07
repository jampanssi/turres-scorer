import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

/**
 * A button or link that holds only an icon (or a short glyph such as initials). It is always a
 * 44 px target (`size-touch`) and always needs an accessible `label`, because there is no visible text.
 */

export type IconButtonVariant = "ghost" | "outline" | "outlineAccent" | "solid";
export type IconButtonShape = "button" | "cell" | "round";

const BASE = "flex size-touch shrink-0 items-center justify-center disabled:cursor-not-allowed";

const SHAPE: Record<IconButtonShape, string> = {
  button: "rounded-button",
  cell: "rounded-cell",
  round: "rounded-full",
};

const VARIANT: Record<IconButtonVariant, string> = {
  /** No background or border: the header back arrow. */
  ghost: "",
  /** White with a grey 2 px border: the stepper minus. */
  outline: "border-2 border-border bg-surface text-text-label disabled:text-disabled",
  /** White with a thin 1.5 px border and a blue icon: the per-row undo in the matrix. */
  outlineAccent: "border-[1.5px] border-border bg-surface text-primary-text disabled:text-disabled",
  /** Blue fill: the stepper plus and the avatar. */
  solid: "bg-primary text-white disabled:bg-disabled",
};

interface Look {
  /** Accessible name (aria-label). Required: an icon has no text. */
  label: string;
  variant?: IconButtonVariant;
  shape?: IconButtonShape;
  className?: string;
  children: ReactNode;
}

const look = ({ variant = "ghost", shape = "button", className }: Pick<Look, "variant" | "shape" | "className">) =>
  cx(BASE, SHAPE[shape], VARIANT[variant], className);

export function IconButton({
  label,
  variant,
  shape,
  className,
  type = "button",
  ...props
}: Look & Omit<ComponentProps<"button">, keyof Look | "aria-label">) {
  return <button type={type} aria-label={label} className={look({ variant, shape, className })} {...props} />;
}

export function IconLink({
  label,
  variant,
  shape,
  className,
  ...props
}: Look & Omit<ComponentProps<typeof Link>, keyof Look | "aria-label">) {
  return <Link aria-label={label} className={look({ variant, shape, className })} {...props} />;
}

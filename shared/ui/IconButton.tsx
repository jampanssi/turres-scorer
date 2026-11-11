import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

/**
 * A button or link that holds only an icon (or a short glyph such as initials). It is at least a 44 px
 * target (`size-touch`; 48 px for the header back button) and always needs an accessible `label`,
 * because there is no visible text.
 */

export type IconButtonVariant = "ghost" | "plain" | "tonal" | "solid";
export type IconButtonSize = "default" | "large";
export type IconButtonShape = "button" | "cell" | "round";

const BASE = "flex shrink-0 items-center justify-center disabled:cursor-not-allowed";

const SIZE: Record<IconButtonSize, string> = {
  default: "size-touch", // 44 px
  large: "size-12", // 48 px: the header back button
};

const SHAPE: Record<IconButtonShape, string> = {
  button: "rounded-button",
  cell: "rounded-cell",
  round: "rounded-full",
};

const VARIANT: Record<IconButtonVariant, string> = {
  /** No background, border or colour of its own: it takes the surrounding text colour. */
  ghost: "",
  /** Transparent, no border, a blue icon (grey when disabled): the header back arrow and the per-row undo. */
  plain: "text-primary-text disabled:text-disabled",
  /** Tonal fill: the stepper minus. When disabled the whole button fades (its icon keeps its colour, so it stays legible). */
  tonal: "bg-tonal text-on-tonal disabled:opacity-60",
  /** Blue fill: the stepper plus and the avatar. */
  solid: "bg-primary text-white disabled:bg-disabled",
};

interface Look {
  /** Accessible name (aria-label). Required: an icon has no text. */
  label: string;
  variant?: IconButtonVariant;
  shape?: IconButtonShape;
  size?: IconButtonSize;
  className?: string;
  children: ReactNode;
}

const look = ({
  variant = "ghost",
  shape = "button",
  size = "default",
  className,
}: Pick<Look, "variant" | "shape" | "size" | "className">) =>
  cx(BASE, SIZE[size], SHAPE[shape], VARIANT[variant], className);

export function IconButton({
  label,
  variant,
  shape,
  size,
  className,
  type = "button",
  ...props
}: Look & Omit<ComponentProps<"button">, keyof Look | "aria-label">) {
  return <button type={type} aria-label={label} className={look({ variant, shape, size, className })} {...props} />;
}

export function IconLink({
  label,
  variant,
  shape,
  size,
  className,
  ...props
}: Look & Omit<ComponentProps<typeof Link>, keyof Look | "aria-label">) {
  return <Link aria-label={label} className={look({ variant, shape, size, className })} {...props} />;
}

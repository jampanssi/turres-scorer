import type { HTMLAttributes } from "react";
import { cx } from "./cx";

interface CardStyle {
  /** Corner radius: "card" (14 px, most cards) or "event" (16 px, the match cards). */
  radius?: "card" | "event";
  /** The soft shadow. Cards inside a sheet are flat. */
  elevated?: boolean;
}

/**
 * The look of a card (white surface, radius, shadow) as a class string, for elements that cannot be
 * a `<Card>` (a link, for example). Add the layout and padding with your own classes.
 */
export function cardClass({ radius = "card", elevated = true }: CardStyle = {}): string {
  return cx("bg-surface", radius === "event" ? "rounded-event" : "rounded-card", elevated && "shadow-card");
}

interface CardProps extends HTMLAttributes<HTMLElement>, CardStyle {
  as?: "div" | "section" | "article";
}

/** A white card. It sets only the look; padding and layout come from `className`. */
export function Card({ as: Tag = "div", radius, elevated, className, ...props }: CardProps) {
  return <Tag className={cx(cardClass({ radius, elevated }), className)} {...props} />;
}

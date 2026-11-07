import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "./cx";
import { ChevronRightIcon } from "./icons";

export type ListCardState = "done" | "active" | "idle";

interface ListCardProps {
  href: string;
  /** Number shown in the 48 px tile. */
  number: number | string;
  title: string;
  /** Secondary lines under the title. */
  lines?: ReactNode[];
  /** Status text on the right of the title row (Done / On range / HF value ...). */
  status?: ReactNode;
  state?: ListCardState;
  /** Shooter rows use a smaller radius and a tinted background when active. */
  variant?: "default" | "shooter";
  /** Extra content under the lines, inside the text column, e.g. a ProgressBar. */
  footer?: ReactNode;
  /** Hide the chevron (e.g. rows that are not tappable yet). */
  noChevron?: boolean;
}

const TILE: Record<ListCardState, string> = {
  done: "bg-success-tint text-success-text",
  active: "bg-primary text-white",
  idle: "bg-surface-tile text-primary-text",
};

export function ListCard({
  href,
  number,
  title,
  lines,
  status,
  state = "idle",
  variant = "default",
  footer,
  noChevron,
}: ListCardProps) {
  const active = state === "active";
  return (
    <Link
      href={href}
      className={cx(
        "flex items-center gap-3 border-2 p-3 shadow-card",
        variant === "shooter" ? "rounded-button" : "rounded-card",
        active ? "border-primary" : "border-transparent",
        active && variant === "shooter" ? "bg-primary-tint" : "bg-surface",
      )}
    >
      <div
        className={cx(
          "flex size-12 shrink-0 items-center justify-center rounded-button font-display text-2xl font-bold",
          TILE[state],
        )}
      >
        {number}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-base font-bold">{title}</span>
          {status && (
            <span
              className={cx(
                "shrink-0 text-sm font-semibold",
                state === "done" ? "text-success-text" : active ? "text-primary-text" : "text-text-secondary",
              )}
            >
              {status}
            </span>
          )}
        </div>
        {lines?.map((line, i) => (
          <div key={i} className="truncate text-[13px] text-text-secondary">
            {line}
          </div>
        ))}
        {footer && <div className="mt-2">{footer}</div>}
      </div>
      {!noChevron && <ChevronRightIcon className="shrink-0 text-chevron" />}
    </Link>
  );
}

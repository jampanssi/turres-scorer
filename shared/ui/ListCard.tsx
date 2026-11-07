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
  /** Status text on the right (Done / On range / HF value ...). */
  status?: ReactNode;
  state?: ListCardState;
  /** Shooter rows use a smaller radius and a tinted background when active. */
  variant?: "default" | "shooter";
  /** Extra content under the main row, e.g. a ProgressBar. */
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
        "block border-2 p-3 shadow-card",
        variant === "shooter" ? "rounded-button" : "rounded-card",
        active ? "border-primary" : "border-transparent",
        active && variant === "shooter" ? "bg-primary-tint" : "bg-surface",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cx(
            "flex size-12 shrink-0 items-center justify-center rounded-button font-display text-2xl font-bold",
            TILE[state],
          )}
        >
          {number}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-bold">{title}</span>
          {lines?.map((line, i) => (
            <span key={i} className="block truncate text-[13px] text-text-secondary">
              {line}
            </span>
          ))}
        </span>
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
        {!noChevron && <ChevronRightIcon className="shrink-0 text-chevron" />}
      </div>
      {footer && <div className="mt-3">{footer}</div>}
    </Link>
  );
}

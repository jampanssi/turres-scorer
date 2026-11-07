"use client";

import { type ReactNode, useId } from "react";
import { cx } from "./cx";
import { Dialog } from "./Dialog";

interface BottomSheetProps {
  open: boolean;
  /** Escape or a tap outside the sheet. The sheet only closes when the caller sets `open` to false. */
  onClose: () => void;
  title: string;
  /** Line under the title, e.g. the shooter line. */
  subtitle?: string;
  /** Icon shown to the left of the title and subtitle (Confirm DQ / DNF). */
  icon?: ReactNode;
  /** Sheet background: "bg" (default, grey like the page) or "surface" (white). Confirm DQ and DNF use surface. */
  tone?: "bg" | "surface";
  children: ReactNode;
  /** Action row at the bottom (Cancel/Edit left, confirm right). */
  actions?: ReactNode;
}

/**
 * A sheet anchored to the bottom of the screen, on a native modal `<dialog>` (see Dialog): focus is
 * trapped inside, Escape and a tap outside ask to close, and focus returns to the trigger afterwards.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  icon,
  tone = "bg",
  children,
  actions,
}: BottomSheetProps) {
  const titleId = useId();

  return (
    <Dialog open={open} onDismiss={onClose} labelledBy={titleId}>
      <div
        className={cx(
          "flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-sheet pt-2.5 shadow-sheet",
          tone === "surface" ? "bg-surface" : "bg-bg",
        )}
      >
        <div className="mx-auto h-[5px] w-10 shrink-0 rounded-full bg-border" aria-hidden="true" />
        <div className="overflow-y-auto px-5 pb-3 pt-3">
          <div className="flex items-center gap-3">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0">
              <h2 id={titleId} className="font-display text-[26px] font-bold uppercase leading-none">
                {title}
              </h2>
              {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
            </div>
          </div>
          <div className="mt-4">{children}</div>
        </div>
        {actions && <div className="flex gap-3 px-5 pb-5 pt-2">{actions}</div>}
      </div>
    </Dialog>
  );
}

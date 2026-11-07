"use client";

import { type ReactNode, useEffect, useId } from "react";

interface BottomSheetProps {
  open: boolean;
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

/** Modal sheet anchored to the bottom over a scrim. Closes on Escape and on scrim tap. */
export function BottomSheet({ open, onClose, title, subtitle, icon, tone = "bg", children, actions }: BottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-scrim" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-sheet pt-2.5 shadow-sheet ${tone === "surface" ? "bg-surface" : "bg-bg"}`}
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
    </div>
  );
}

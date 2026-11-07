"use client";

import { type ReactNode, useEffect, useId } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Line under the title, e.g. the shooter line. */
  subtitle?: string;
  /** Icon shown above the title (Confirm DQ / DNF). */
  icon?: ReactNode;
  children: ReactNode;
  /** Action row at the bottom (Cancel/Edit left, confirm right). */
  actions?: ReactNode;
}

/** Modal sheet anchored to the bottom over a scrim. Closes on Escape and on scrim tap. */
export function BottomSheet({ open, onClose, title, subtitle, icon, children, actions }: BottomSheetProps) {
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
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-sheet bg-bg pt-2.5 shadow-sheet"
      >
        <div className="mx-auto h-[5px] w-10 shrink-0 rounded-full bg-border" aria-hidden="true" />
        <div className="overflow-y-auto px-5 pb-3 pt-3">
          {icon && <div className="mb-2 flex justify-center">{icon}</div>}
          <h2 id={titleId} className={`font-display text-[26px] font-bold uppercase leading-none ${icon ? "text-center" : ""}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`mt-1 text-sm text-text-secondary ${icon ? "text-center" : ""}`}>{subtitle}</p>
          )}
          <div className="mt-4">{children}</div>
        </div>
        {actions && <div className="flex gap-3 px-5 pb-5 pt-2">{actions}</div>}
      </div>
    </div>
  );
}

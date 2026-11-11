"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useT } from "@/shared/i18n/useT";
import { ButtonLink } from "./Button";
import { CheckIcon, CloseIcon } from "./icons";
import { IconButton } from "./IconButton";
import { dismissToast, getToast, subscribeToast, type Toast } from "./toast";

const SHOW_MS = 6000;

/** The current toast (or null). Screens use it to highlight the row the message is about. */
export function useToast(): Toast | null {
  return useSyncExternalStore(subscribeToast, getToast, () => null);
}

/**
 * Shows the current toast at the bottom of the screen. Mount it once, in the signed-in layout.
 * `role="status"` makes screen readers announce it without taking focus; it also closes by itself.
 */
export function ToastHost() {
  const { t } = useT();
  const toast = useToast();
  const id = toast?.id;

  useEffect(() => {
    if (id === undefined) return;
    const timer = setTimeout(dismissToast, SHOW_MS);
    return () => clearTimeout(timer);
  }, [id]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role="status"
        className="pointer-events-auto flex w-full max-w-lg flex-col rounded-card border-l-4 border-success-accent bg-surface py-1 pl-3 pr-1 shadow-sheet"
      >
        <div className="flex items-center gap-3">
          <CheckIcon className="shrink-0 text-success-text" />
          <p className="min-w-0 flex-1 py-2 text-[15px] font-semibold">{toast.message}</p>
          <IconButton label={t("toast.close")} onClick={dismissToast}>
            <CloseIcon />
          </IconButton>
        </div>
        {toast.action && (
          <ButtonLink
            href={toast.action.href}
            variant="outlinePrimary"
            onClick={dismissToast}
            className="mb-2 mr-2 self-stretch"
          >
            {toast.action.label}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

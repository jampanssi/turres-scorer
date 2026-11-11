"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useT } from "@/shared/i18n/useT";
import { ButtonLink } from "./Button";
import { CheckIcon, CircleXIcon, CloseIcon } from "./icons";
import { IconButton } from "./IconButton";
import { dismissToast, getToast, subscribeToast, type Toast } from "./toast";

/** How long a toast stays: an error is kept longer, because it tells the user to do something. */
const SHOW_MS = { success: 6000, danger: 9000 } as const;

/** The current toast (or null). Screens use it to highlight the row the message is about. */
export function useToast(): Toast | null {
  return useSyncExternalStore(subscribeToast, getToast, () => null);
}

/**
 * Shows the current toast. Mount it once per area: in the signed-in layout, and on Sign in (inside its
 * always-light subtree, so the toast follows that palette).
 * - **success**: a white card at the bottom with a green edge, `role="status"` (announced politely).
 * - **danger**: a HeroUI-style flat red toast: rounded card, tinted background with a thin red border, an
 *   error icon, a bold title, the message and a close button; `role="alert"` (announced at once).
 * Both sit at the bottom of the screen (the usual place on a phone, near the thumb) and close by themselves,
 *   and by the close button. A toast at the bottom covers whatever is there, such as a button, until it closes.
 */
export function ToastHost() {
  const { t } = useT();
  const toast = useToast();
  const id = toast?.id;
  const tone = toast?.tone ?? "success";

  useEffect(() => {
    if (id === undefined) return;
    const timer = setTimeout(dismissToast, SHOW_MS[tone]);
    return () => clearTimeout(timer);
  }, [id, tone]);

  if (!toast) return null;

  if (tone === "danger") {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4">
        <div
          role="alert"
          className="pointer-events-auto flex w-full max-w-lg items-start gap-3 rounded-card border border-danger-fg/30 bg-danger-tint py-3 pl-3.5 pr-1.5 text-danger-text shadow-lg"
        >
          <CircleXIcon className="mt-0.5 shrink-0 text-danger-fg" />
          <div className="min-w-0 flex-1">
            {toast.title && <p className="text-[15px] font-semibold leading-snug">{toast.title}</p>}
            <p className="text-sm leading-snug opacity-90">{toast.message}</p>
          </div>
          <IconButton label={t("toast.close")} onClick={dismissToast} className="-mt-1.5">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
    );
  }

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

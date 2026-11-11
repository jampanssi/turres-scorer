"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useT } from "@/shared/i18n/useT";
import { CircleCheckIcon, CircleXIcon, CloseIcon } from "./icons";
import { dismissToast, getToast, subscribeToast, type Toast } from "./toast";

/** How long a toast stays: an error is kept longer, because it tells the user to do something. */
const SHOW_MS = { success: 6000, danger: 9000 } as const;

const LOOK = {
  success: {
    title: "text-success-text",
    icon: "text-success-accent",
    Icon: CircleCheckIcon,
    role: "status", // announced politely
  },
  danger: {
    title: "text-danger-text",
    icon: "text-danger-fg",
    Icon: CircleXIcon,
    role: "alert", // announced at once
  },
} as const;

/** The current toast (or null). Screens use it to highlight the row the message is about. */
export function useToast(): Toast | null {
  return useSyncExternalStore(subscribeToast, getToast, () => null);
}

/**
 * Shows the current toast: a white, very rounded card at the bottom of the screen (the usual place on a phone,
 * near the thumb), with a soft shadow. A coloured icon, an optional title in the tone's colour, the message in
 * grey and a small round close button on the top-right corner. Green for a confirmation (`role="status"`), red for an error
 * (`role="alert"`). It closes by itself, and by the close button. Mount it once per area: in the signed-in
 * layout, and on Sign in (inside its always-light subtree, so the toast follows that palette). A toast
 * covers whatever is behind it until it closes.
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
  const { title, icon, Icon, role } = LOOK[tone];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4">
      <div
        role={role}
        className="pointer-events-auto relative flex w-full max-w-lg items-start gap-3.5 rounded-[28px] bg-surface py-4 pl-5 pr-5 shadow-lg ring-1 ring-border"
      >
        <Icon className={`mt-0.5 shrink-0 ${icon}`} />
        <div className="min-w-0 flex-1">
          {toast.title && <p className={`text-base font-semibold leading-snug ${title}`}>{toast.title}</p>}
          <p className="text-[15px] leading-snug text-text-secondary">{toast.message}</p>
        </div>
        <button
          type="button"
          aria-label={t("toast.close")}
          onClick={dismissToast}
          className="absolute -right-2 -top-3.5 flex size-11 items-center justify-center text-text-secondary"
        >
          <span className="flex size-6 items-center justify-center rounded-full border border-border bg-surface shadow-md">
            <CloseIcon className="size-3" />
          </span>
        </button>
      </div>
    </div>
  );
}

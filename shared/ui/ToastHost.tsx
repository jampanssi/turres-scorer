"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useT } from "@/shared/i18n/useT";
import { CircleCheckIcon, CircleXIcon, CloseIcon } from "./icons";
import { IconButton } from "./IconButton";
import { dismissToast, getToast, subscribeToast, type Toast } from "./toast";

/** How long a toast stays: an error is kept longer, because it tells the user to do something. */
const SHOW_MS = { success: 6000, danger: 9000 } as const;

const LOOK = {
  success: {
    card: "border-success-accent/30 bg-success-tint text-success-text",
    icon: "text-success-accent",
    Icon: CircleCheckIcon,
    role: "status", // announced politely
  },
  danger: {
    card: "border-danger-fg/30 bg-danger-tint text-danger-text",
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
 * Shows the current toast: a HeroUI-style flat card at the bottom of the screen (the usual place on a phone,
 * near the thumb). Rounded, a tinted background with a thin border in the same colour, an icon, an optional
 * bold title, the message and a close button. Green for a confirmation (`role="status"`), red for an error
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
  const { card, icon, Icon, role } = LOOK[tone];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4">
      <div
        role={role}
        className={`pointer-events-auto flex w-full max-w-lg items-start gap-3 rounded-card border py-3 pl-3.5 pr-1.5 shadow-lg ${card}`}
      >
        <Icon className={`mt-0.5 shrink-0 ${icon}`} />
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

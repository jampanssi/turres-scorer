"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { LOCALES, writeLocale } from "@/shared/i18n/locale";
import { useT } from "@/shared/i18n/useT";
import { writePreference } from "@/shared/theme/theme";
import { useResolvedTheme } from "@/shared/theme/useResolvedTheme";
import { GlobeIcon, LogoutIcon, MoonIcon, SunIcon } from "@/shared/ui/icons";
import { signOut } from "./session";
import { useSession } from "./useSession";

function MenuRow({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 w-full items-center gap-3 rounded-input px-3 text-left text-base font-medium hover:bg-surface-muted"
    >
      <span className="shrink-0 text-text-secondary">{icon}</span>
      {label}
    </button>
  );
}

/**
 * Avatar button in the header that opens the user menu: user card, theme, language and sign out.
 * The theme and language rows name what you will switch TO (light is on -> "Dark mode";
 * English is on -> "Suomi") and switch on tap. Renders nothing when signed out. Closes on
 * Escape, on a tap outside, and after signing out.
 */
export function UserMenu() {
  const router = useRouter();
  const { t, locale } = useT();
  const session = useSession();
  const theme = useResolvedTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (session.status !== "signedIn") return null;
  const { email, initials } = session.session;

  const nextLocale = LOCALES[(LOCALES.findIndex((l) => l.code === locale) + 1) % LOCALES.length];
  const toDark = theme === "light";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={t("menu.label", { email })}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-white"
      >
        {initials}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("menu.label", { email })}
          className="absolute right-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-card border border-border-light bg-surface p-2 text-text shadow-sheet"
        >
          <div className="flex items-center gap-3 rounded-input border border-border-light bg-surface-muted p-3">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-white"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-text-secondary">{t("menu.signedInAs")}</p>
              <p className="truncate text-[15px] font-bold">{email}</p>
            </div>
          </div>

          <div className="mt-1">
            <MenuRow
              icon={toDark ? <MoonIcon strokeWidth={2} /> : <SunIcon strokeWidth={2} />}
              label={t(toDark ? "menu.theme.toDark" : "menu.theme.toLight")}
              onClick={() => writePreference(toDark ? "dark" : "light")}
            />
            <MenuRow
              icon={<GlobeIcon strokeWidth={2} />}
              label={nextLocale.name}
              onClick={() => writeLocale(nextLocale.code)}
            />
          </div>

          <hr className="my-1 border-divider" />

          <MenuRow
            icon={<LogoutIcon strokeWidth={2} />}
            label={t("menu.signOut")}
            onClick={() => {
              signOut();
              router.replace("/");
            }}
          />
        </div>
      )}
    </div>
  );
}

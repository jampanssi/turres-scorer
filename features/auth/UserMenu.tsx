"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LOCALES, writeLocale } from "@/shared/i18n/locale";
import { useT } from "@/shared/i18n/useT";
import { writePreference } from "@/shared/theme/theme";
import { useResolvedTheme } from "@/shared/theme/useResolvedTheme";
import { IconButton } from "@/shared/ui/IconButton";
import { GlobeIcon, LogoutIcon, MoonIcon, SunIcon } from "@/shared/ui/icons";
import { Popover } from "@/shared/ui/Popover";
import { signOut } from "./session";
import { useSession } from "./useSession";

const AVATAR = "font-display text-lg font-bold";

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
 * Escape and on a tap outside (see Popover), and after signing out the page changes.
 */
export function UserMenu() {
  const router = useRouter();
  const { t, locale } = useT();
  const session = useSession();
  const theme = useResolvedTheme();

  if (session.status !== "signedIn") return null;
  const { email, initials } = session.session;
  const label = t("menu.label", { email });

  const nextLocale = LOCALES[(LOCALES.findIndex((l) => l.code === locale) + 1) % LOCALES.length];
  const toDark = theme === "light";

  return (
    <Popover
      label={label}
      panelClassName="w-72 max-w-[calc(100vw-1.5rem)] rounded-card border border-border-light bg-surface p-2 text-text shadow-sheet"
      trigger={(triggerProps) => (
        <IconButton {...triggerProps} label={label} variant="solid" shape="round" className={AVATAR}>
          {initials}
        </IconButton>
      )}
    >
      <div className="flex items-center gap-3 rounded-input border border-border-light bg-surface-muted p-3">
        <span
          aria-hidden="true"
          className={`flex size-touch shrink-0 items-center justify-center rounded-full bg-primary text-white ${AVATAR}`}
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
    </Popover>
  );
}

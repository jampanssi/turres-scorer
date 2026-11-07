import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeftIcon } from "./icons";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Back link; omit on the root screen (Matches). */
  back?: { href: string; label: string };
  /** Right-side slot: pass `<UserMenu />` (features/auth) on signed-in screens. */
  right?: ReactNode;
  /** Content under the title row, e.g. the Open | Results segmented control. */
  children?: ReactNode;
}

/** Plain header on the page background (no coloured bar). */
export function AppHeader({ title, subtitle, back, right, children }: AppHeaderProps) {
  return (
    <header className="bg-bg px-3 pb-3 pt-3 text-text">
      <div className="flex items-center gap-1">
        {back && (
          <Link
            href={back.href}
            aria-label={back.label}
            className="flex size-11 shrink-0 items-center justify-center rounded-button"
          >
            <ChevronLeftIcon />
          </Link>
        )}
        <div className={back ? "min-w-0 flex-1" : "min-w-0 flex-1 pl-1"}>
          {/* Fixed heights (even with no subtitle or while loading) keep the title at the same
              position on every screen, so it doesn't jump when navigating. */}
          <h1 className="min-h-[26px] truncate font-display text-[26px] font-bold uppercase leading-none">
            {title}
          </h1>
          <p className="mt-1 h-[18px] truncate text-[13px] leading-[18px] text-text-secondary">{subtitle}</p>
        </div>
        {right}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </header>
  );
}

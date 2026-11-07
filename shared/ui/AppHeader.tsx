"use client";

import Link from "next/link";
import { type ReactNode, useSyncExternalStore } from "react";
import { ChevronLeftIcon } from "./icons";
import { cx } from "./cx";

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

function subscribeToScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** True once the page has scrolled, i.e. content can be sliding under the sticky header. */
function useScrolled(): boolean {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 0,
    () => false,
  );
}

/**
 * Plain header on the page background (no coloured bar). It is sticky: it stays at the top while the
 * page scrolls, so the shooter, back arrow and user menu are always visible. A divider and a soft
 * shadow appear only while content has scrolled underneath it. Layering: above the page and the
 * bottom bar (z-10), below sheets (z-50). The user menu popover lives inside the header.
 */
export function AppHeader({ title, subtitle, back, right, children }: AppHeaderProps) {
  const scrolled = useScrolled();

  return (
    <header
      className={cx(
        "sticky top-0 z-20 border-b bg-bg px-3 pb-3 pt-3 text-text transition-shadow",
        scrolled ? "border-border-light shadow-card" : "border-transparent",
      )}
    >
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
          <h1 className="min-h-[26px] truncate font-display text-[26px] font-bold uppercase leading-none">{title}</h1>
          <p className="mt-1 h-[18px] truncate text-[13px] leading-[18px] text-text-secondary">{subtitle}</p>
        </div>
        {right}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </header>
  );
}

"use client";

import type { MouseEventHandler, ReactNode } from "react";
import { IconLink } from "./IconButton";
import { ArrowLeftIcon } from "./icons";
import { cx } from "./cx";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Back link; omit on the root screen (Matches). */
  back?: { href: string; label: string; onClick?: MouseEventHandler<HTMLAnchorElement> };
  /** Right-side slot: pass `<UserMenu />` (features/auth) on signed-in screens. */
  right?: ReactNode;
  /** Content under the title bar, e.g. the Open | Results segmented control. */
  children?: ReactNode;
}

/**
 * The header: a light, slightly see-through bar (`header`) with a 1 px hairline under it. The bar is 64 px
 * tall: a 48 px round back arrow (the Android arrow, no text), the title and subtitle left-aligned, and the
 * right slot. It is sticky and always shows its hairline, so the shooter, the back arrow and the user menu
 * stay in view while the page scrolls. Extra content (tabs) sits under the bar inside the same sticky
 * header. Layering: above the page and the bottom bar (z-10), below sheets (z-50). The user menu popover
 * lives inside the header.
 */
export function AppHeader({ title, subtitle, back, right, children }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-header-border bg-header text-text">
      <div className="flex h-16 items-center gap-1 px-1">
        {back && (
          <IconLink
            href={back.href}
            label={back.label}
            onClick={back.onClick}
            variant="plain"
            shape="round"
            size="large"
          >
            <ArrowLeftIcon />
          </IconLink>
        )}
        {/* Fixed heights (even with no subtitle or while loading) keep the title at the same position on
            every screen, so it doesn't jump when navigating. Without a back arrow the title is indented to
            line up with the content below. */}
        <div className={cx("min-w-0 flex-1", !back && "pl-3")}>
          <h1 className="h-6 truncate font-display text-2xl font-bold uppercase leading-none">{title}</h1>
          <p className="mt-0.5 h-[18px] truncate text-[13px] leading-[18px] text-text-secondary">{subtitle}</p>
        </div>
        {right && <div className="mr-1 flex shrink-0">{right}</div>}
      </div>
      {children && <div className="px-3 pb-3">{children}</div>}
    </header>
  );
}

import Link from "next/link";
import { cx } from "./cx";

interface TabLinksProps {
  /** Accessible name for the group. */
  label: string;
  tabs: ReadonlyArray<{ href: string; label: string; current: boolean }>;
}

/**
 * Tabs that are separate pages (real links, `aria-current`), looking like `Segmented`: a white track
 * with the current tab filled blue. Used for Squads | Roll call, which have their own URLs.
 */
export function TabLinks({ label, tabs }: TabLinksProps) {
  return (
    <nav aria-label={label} className="flex rounded-button bg-surface p-1 shadow-card">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          replace
          aria-current={tab.current ? "page" : undefined}
          className={cx(
            "flex h-10 flex-1 items-center justify-center rounded-[8px] font-display text-lg font-bold uppercase tracking-wide",
            tab.current ? "bg-primary text-white" : "text-text-label",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeftIcon } from "./icons";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Back link; omit on the root screen (Matches). */
  back?: { href: string; label: string };
  /** Right-side slot, e.g. the account avatar. */
  right?: ReactNode;
  /** Content under the title row, e.g. the Open | Results segmented control. */
  children?: ReactNode;
}

export function AppHeader({ title, subtitle, back, right, children }: AppHeaderProps) {
  return (
    <header className="bg-primary px-3 pb-3 pt-3 text-white">
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
          <h1 className="truncate font-display text-[26px] font-bold uppercase leading-none">{title}</h1>
          {subtitle && <p className="mt-1 truncate text-[13px] text-on-primary-muted">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </header>
  );
}

/** Account avatar for the Matches header: 44 px circle with initials. */
export function Avatar({ initials, label }: { initials: string; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-white font-display text-lg font-bold"
    >
      {initials}
    </span>
  );
}

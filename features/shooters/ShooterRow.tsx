"use client";

import Link from "next/link";
import { formatHitFactor } from "@/shared/i18n/format";
import { useT } from "@/shared/i18n/useT";
import { cx } from "@/shared/ui/cx";
import type { ShooterRowData } from "./rows";

/**
 * One shooter in the shooting order. The right side shows HF, a status word, or a dash.
 * Disqualified shooters are shown but cannot be opened: they render as plain, dimmed rows.
 */
export function ShooterRow({ row, href }: { row: ShooterRowData; href: string }) {
  const { t } = useT();
  const shooting = row.state === "shooting";
  const disqualified = row.state === "dq";

  const content = (
    <>
      <span className="w-6 shrink-0 text-center font-display text-2xl font-bold text-text-secondary">{row.order}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-bold">{row.shooter.name}</div>
        <div className="text-[13px] text-text-secondary">#{row.shooter.competitorNumber}</div>
      </div>
      <div className="shrink-0 text-right">
        {row.state === "scored" && (
          <>
            <div className="font-display text-[26px] font-bold leading-none text-success-text">
              {formatHitFactor(row.hitFactor ?? 0)}
            </div>
            <div className="mt-1 text-[13px] font-bold leading-none text-text-secondary">{t("shooters.hf")}</div>
          </>
        )}
        {row.state === "shooting" && (
          <span className="text-lg font-bold text-primary-text">{t("shooters.status.shooting")}</span>
        )}
        {row.state === "onDeck" && (
          <span className="text-lg font-bold text-text-secondary">{t("shooters.status.onDeck")}</span>
        )}
        {row.state === "dnf" && (
          <span className="text-lg font-bold text-text-secondary">{t("shooters.status.dnf")}</span>
        )}
        {row.state === "dq" && <span className="text-lg font-bold text-danger-fg">{t("shooters.status.dq")}</span>}
        {row.state === "waiting" && (
          <>
            <span aria-hidden="true" className="text-lg font-bold text-text-secondary">
              —
            </span>
            <span className="sr-only">{t("shooters.status.waiting")}</span>
          </>
        )}
      </div>
    </>
  );

  if (disqualified) {
    return (
      <div
        aria-disabled="true"
        className="flex items-center gap-4 rounded-button border-2 border-transparent bg-surface p-3 opacity-60"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cx(
        "flex items-center gap-4 rounded-button border-2 p-3 shadow-card",
        shooting ? "border-primary bg-primary-tint" : "border-transparent bg-surface",
      )}
    >
      {content}
    </Link>
  );
}

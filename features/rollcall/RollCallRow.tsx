"use client";

import { useT } from "@/shared/i18n/useT";
import { cardClass } from "@/shared/ui/Card";
import { cx } from "@/shared/ui/cx";
import type { ShooterRowData } from "./summary";

/**
 * One shooter in a squad: name, number, and a single **DNS** button that marks them as not showing
 * (tap again to take it back). The pressed state is filled and `aria-pressed`, so it is not shown by
 * colour alone. A shooter disqualified from the match is shown dimmed with DQ and cannot be marked.
 */
export function RollCallRow({
  row,
  onToggle,
  locked = false,
}: {
  row: ShooterRowData;
  onToggle: (dns: boolean) => void;
  /** The match is completed: the DNS button stays visible but cannot be tapped. */
  locked?: boolean;
}) {
  const { t } = useT();

  return (
    <div
      className={cx(cardClass(), "flex items-center gap-3 p-3", row.disqualified && "opacity-60")}
      aria-disabled={row.disqualified || undefined}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-bold">{row.shooter.name}</div>
        <div className="text-[13px] text-text-secondary">#{row.shooter.competitorNumber}</div>
      </div>

      {row.disqualified ? (
        <span className="shrink-0 text-lg font-bold text-danger-fg">{t("common.dq")}</span>
      ) : (
        <button
          type="button"
          aria-pressed={row.dns}
          disabled={locked}
          aria-label={`${t("common.dns")}: ${row.shooter.name}`}
          onClick={() => onToggle(!row.dns)}
          className={cx(
            "min-h-touch min-w-[76px] shrink-0 rounded-button px-3 font-display text-lg font-bold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-60",
            row.dns ? "bg-text-label text-bg" : "border-2 border-border bg-surface text-text-label",
          )}
        >
          {t("common.dns")}
        </button>
      )}
    </div>
  );
}

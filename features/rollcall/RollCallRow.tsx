"use client";

import { useT } from "@/shared/i18n/useT";
import { cardClass } from "@/shared/ui/Card";
import { cx } from "@/shared/ui/cx";
import { MoreIcon } from "@/shared/ui/icons";
import type { ShooterRowData } from "./summary";

/**
 * One shooter in a squad: name, number, a status word when they are DNS or disqualified (never colour alone),
 * and the three dots that show the whole card opens the shooter's actions (Change squad, DNS). A shooter disqualified from the
 * match is dimmed with DQ.
 */
export function RollCallRow({
  row,
  onActions,
  locked = false,
}: {
  row: ShooterRowData;
  onActions: () => void;
  /** The match is completed: the button stays visible but cannot be tapped. */
  locked?: boolean;
}) {
  const { t } = useT();

  return (
    <button
      type="button"
      aria-label={t("shooters.actions.open", { name: row.shooter.name })}
      disabled={locked}
      onClick={onActions}
      className={cx(
        cardClass(),
        "flex min-h-touch w-full items-center gap-3 py-1 pl-3 pr-4 text-left disabled:cursor-not-allowed",
      )}
    >
      <div className={cx("min-w-0 flex-1 py-2", row.disqualified && "opacity-60")}>
        <div className="truncate text-base font-bold">{row.shooter.name}</div>
        <div className="text-[13px] text-text-secondary">#{row.shooter.competitorNumber}</div>
      </div>
      {row.disqualified && <span className="shrink-0 text-lg font-bold text-danger-fg">{t("common.dq")}</span>}
      {!row.disqualified && row.dns && (
        <span className="shrink-0 text-lg font-bold text-text-secondary">{t("common.dns")}</span>
      )}
      <MoreIcon className={cx("shrink-0 text-text-secondary", locked && "opacity-40")} />
    </button>
  );
}

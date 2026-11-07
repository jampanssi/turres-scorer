"use client";

import Link from "next/link";
import { formatDate } from "@/shared/i18n/format";
import { useT } from "@/shared/i18n/useT";
import { cardClass } from "@/shared/ui/Card";
import { cx } from "@/shared/ui/cx";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import type { MatchSummary } from "./summary";

const STRIP: Record<MatchSummary["match"]["status"], string | null> = {
  live: "bg-primary-text",
  open: null,
  finished: "bg-success-accent",
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-input bg-surface-muted px-2.5 py-2">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-[17px] font-bold">{value}</span>
    </div>
  );
}

export function MatchCard({ summary }: { summary: MatchSummary }) {
  const { t } = useT();
  const { match } = summary;
  return (
    <Link
      href={`/matches/${match.id}`}
      className={cx(cardClass({ radius: "event" }), "relative flex flex-col gap-3 overflow-hidden p-4")}
    >
      {/* Status strip on the left edge: blue = live, green = finished, none = upcoming. */}
      {STRIP[match.status] && (
        <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${STRIP[match.status]}`} />
      )}
      <div>
        <h2 className="font-display text-[22px] font-bold leading-[1.1]">
          {match.name}
          {/* The strip is colour only, so the status is also available as text for screen readers. */}
          <span className="sr-only"> — {t(`matches.status.${match.status}` as const)}</span>
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{formatDate(match.date)}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label={t("matches.stages")} value={summary.stages} />
        <Stat label={t("matches.squads")} value={summary.squads} />
        <Stat label={t("matches.shooters")} value={summary.shooters} />
      </div>

      {match.status === "live" && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[13px] text-text-secondary">
            <span>{t("matches.scored")}</span>
            <span className="font-semibold text-text">
              {summary.scored} / {summary.totalScores}
            </span>
          </div>
          <ProgressBar value={summary.scored} max={summary.totalScores} label={t("matches.scored")} />
        </div>
      )}
    </Link>
  );
}

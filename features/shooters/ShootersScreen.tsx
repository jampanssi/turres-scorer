"use client";

import { useParams } from "next/navigation";
import { Screen } from "@/features/shell/Screen";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { formatStageTargets } from "@/shared/i18n/format-stage";
import { useT } from "@/shared/i18n/useT";
import { cx } from "@/shared/ui/cx";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { useToast } from "@/shared/ui/ToastHost";
import { ShooterRow } from "./ShooterRow";
import { loadShootersOverview } from "./rows";

export function ShootersScreen() {
  const { t } = useT();
  const { matchId, squadId, stageId } = useParams<{ matchId: string; squadId: string; stageId: string }>();
  const toast = useToast();
  const overview = useRepoQuery(["shooters", matchId, squadId, stageId], (repo) =>
    loadShootersOverview(repo, matchId, squadId, stageId),
  );

  return (
    <Screen
      state={overview}
      header={(data) => ({
        title: data
          ? `${t("common.squad", { number: data.squad.number })} · ${t("common.stage", { number: data.stage.number })}`
          : "",
        subtitle: data ? formatStageTargets(data.stage, t) : undefined,
      })}
      back={{ href: `/matches/${matchId}/stages/${stageId}`, label: t("shooters.back") }}
      notFound={t("shooters.notFound")}
    >
      {(data) => (
        <main className={cx("flex flex-1 flex-col", toast ? "pb-28" : "pb-4")}>
          <SectionHeader
            title={t("shooters.section")}
            count={{ done: data.scoredCount, total: data.totalCount, label: t("shooters.scoredLabel") }}
          />
          {data.rows.length === 0 && <p className="px-4 pt-2 text-text-secondary">{t("shooters.empty")}</p>}
          <ul className="flex flex-col gap-2 px-4">
            {data.rows.map((row) => (
              <li key={row.shooter.id}>
                <ShooterRow
                  row={row}
                  href={`/matches/${matchId}/stages/${stageId}/squads/${squadId}/score/${row.shooter.id}`}
                  justSaved={toast?.shooterId === row.shooter.id}
                />
              </li>
            ))}
          </ul>
        </main>
      )}
    </Screen>
  );
}

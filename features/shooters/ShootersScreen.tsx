"use client";

import { useParams } from "next/navigation";
import { Screen } from "@/features/shell/Screen";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { formatStageTargets } from "@/shared/i18n/format-stage";
import { useT } from "@/shared/i18n/useT";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { ShooterRow } from "./ShooterRow";
import { loadShootersOverview } from "./rows";

export function ShootersScreen() {
  const { t } = useT();
  const { matchId, squadId, stageId } = useParams<{ matchId: string; squadId: string; stageId: string }>();
  const overview = useRepoQuery(["shooters", matchId, squadId, stageId], (repo) =>
    loadShootersOverview(repo, matchId, squadId, stageId),
  );

  return (
    <Screen
      state={overview}
      header={(data) => ({
        title: data
          ? `${t("squads.squad", { number: data.squad.number })} · ${t("shooters.stage", { number: data.stage.number })}`
          : "",
        subtitle: data ? formatStageTargets(data.stage, t) : undefined,
      })}
      back={{ href: `/matches/${matchId}/squads/${squadId}`, label: t("shooters.back") }}
      notFound={t("shooters.notFound")}
    >
      {(data) => (
        <main className="flex flex-1 flex-col pb-4">
          <SectionHeader
            title={t("shooters.section")}
            count={{ done: data.scoredCount, total: data.totalCount, label: t("shooters.scoredLabel") }}
          />
          <ul className="flex flex-col gap-2 px-4">
            {data.rows.map((row) => (
              <li key={row.shooter.id}>
                <ShooterRow
                  row={row}
                  href={`/matches/${matchId}/squads/${squadId}/stages/${stageId}/score/${row.shooter.id}`}
                />
              </li>
            ))}
          </ul>
        </main>
      )}
    </Screen>
  );
}

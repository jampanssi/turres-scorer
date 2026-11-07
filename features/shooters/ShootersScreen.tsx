"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";
import { UserMenu } from "@/features/auth/UserMenu";
import { useRequireSession } from "@/features/auth/useRequireSession";
import { getRepository } from "@/shared/data";
import { useLoad } from "@/shared/data/useLoad";
import { formatStageTargets } from "@/shared/i18n/format-stage";
import { useT } from "@/shared/i18n/useT";
import { AppHeader } from "@/shared/ui/AppHeader";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { ShooterRow } from "./ShooterRow";
import { loadShootersOverview } from "./rows";

export function ShootersScreen() {
  const { t } = useT();
  const { matchId, squadId, stageId } = useParams<{ matchId: string; squadId: string; stageId: string }>();
  const session = useRequireSession();
  const load = useCallback(
    () => loadShootersOverview(getRepository(), matchId, squadId, stageId),
    [matchId, squadId, stageId],
  );
  const overview = useLoad(load);

  if (session.status !== "signedIn") return <div className="min-h-dvh bg-bg" />;

  const data = overview.status === "ready" ? overview.data : null;

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <AppHeader
        title={
          data
            ? `${t("squads.squad", { number: data.squad.number })} · ${t("shooters.stage", { number: data.stage.number })}`
            : ""
        }
        subtitle={data ? formatStageTargets(data.stage, t) : undefined}
        back={{ href: `/matches/${matchId}/squads/${squadId}`, label: t("shooters.back") }}
        right={<UserMenu />}
      />

      <main className="flex flex-1 flex-col pb-4">
        {overview.status === "loading" && <p className="px-4 pt-4 text-text-secondary">{t("common.loading")}</p>}
        {overview.status === "error" && (
          <p role="alert" className="px-4 pt-4 text-danger-fg">
            {t("common.error")}
          </p>
        )}
        {overview.status === "ready" && !data && (
          <p className="px-4 pt-4 text-text-secondary">{t("shooters.notFound")}</p>
        )}
        {data && (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}

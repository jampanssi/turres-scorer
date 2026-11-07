"use client";

import { useParams } from "next/navigation";
import { UserMenu } from "@/features/auth/UserMenu";
import { useRequireSession } from "@/features/auth/useRequireSession";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { formatStageTargets } from "@/shared/i18n/format-stage";
import { useT } from "@/shared/i18n/useT";
import { AppHeader } from "@/shared/ui/AppHeader";
import { ListCard, type ListCardState } from "@/shared/ui/ListCard";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { loadStagesOverview, type StageStatus } from "./summary";

const CARD_STATE: Record<StageStatus, ListCardState> = {
  done: "done",
  inProgress: "active",
  notStarted: "idle",
};

export function StagesScreen() {
  const { t } = useT();
  const { matchId, squadId } = useParams<{ matchId: string; squadId: string }>();
  const session = useRequireSession();
  const overview = useRepoQuery(["stages", matchId, squadId], (repo) => loadStagesOverview(repo, matchId, squadId));

  if (session.status !== "signedIn") return <div className="min-h-dvh bg-bg" />;

  const data = overview.status === "ready" ? overview.data : null;

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <AppHeader
        title={data ? t("squads.squad", { number: data.squad.number }) : ""}
        subtitle={data ? t("squads.shooterCount", { count: data.squad.shooterIds.length }) : undefined}
        back={{ href: `/matches/${matchId}`, label: t("stages.back") }}
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
          <p className="px-4 pt-4 text-text-secondary">{t("stages.notFound")}</p>
        )}
        {data && (
          <>
            <SectionHeader
              title={t("stages.section")}
              count={{ done: data.stagesDone, total: data.stages.length, label: t("stages.doneLabel") }}
            />
            <ul className="flex flex-col gap-2 px-4">
              {data.stages.map((summary) => (
                <li key={summary.stage.id}>
                  <ListCard
                    href={`/matches/${matchId}/squads/${squadId}/stages/${summary.stage.id}`}
                    number={summary.stage.number}
                    title={summary.stage.name}
                    status={t(`stages.status.${summary.status}` as const)}
                    state={CARD_STATE[summary.status]}
                    lines={[
                      formatStageTargets(summary.stage, t),
                      t("stages.minRounds", { count: summary.stage.minRounds }),
                      t("stages.scored", { scored: summary.scored, total: summary.total }),
                    ]}
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

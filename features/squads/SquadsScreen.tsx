"use client";

import { useParams } from "next/navigation";
import { UserMenu } from "@/features/auth/UserMenu";
import { useRequireSession } from "@/features/auth/useRequireSession";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { useT } from "@/shared/i18n/useT";
import { AppHeader } from "@/shared/ui/AppHeader";
import { ListCard, type ListCardState } from "@/shared/ui/ListCard";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { loadSquadsOverview, type SquadStatus, type SquadSummary } from "./summary";

const CARD_STATE: Record<SquadStatus, ListCardState> = {
  done: "done",
  onRange: "active",
  notStarted: "idle",
};

export function SquadsScreen() {
  const { t } = useT();
  const { matchId } = useParams<{ matchId: string }>();
  const session = useRequireSession();
  const overview = useRepoQuery(["squads", matchId], (repo) => loadSquadsOverview(repo, matchId));

  if (session.status !== "signedIn") return <div className="min-h-dvh bg-bg" />;

  const line = (summary: SquadSummary) =>
    t(`squads.line.${summary.status}` as const, {
      shooters: t("squads.shooterCount", { count: summary.shooters }),
      stage: summary.currentStage?.number ?? "",
      done: summary.stagesDone,
      total: summary.stagesTotal,
    });

  const data = overview.status === "ready" ? overview.data : null;

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <AppHeader
        title={data?.match.name ?? ""}
        subtitle={
          data
            ? [
                t("squads.stageCount", { count: data.stageCount }),
                t("squads.squadCount", { count: data.squads.length }),
                t("squads.shooterCount", { count: data.shooterCount }),
              ].join(" · ")
            : undefined
        }
        back={{ href: "/matches", label: t("squads.back") }}
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
          <p className="px-4 pt-4 text-text-secondary">{t("squads.notFound")}</p>
        )}
        {data && (
          <>
            <SectionHeader title={t("squads.section")} />
            <ul className="flex flex-col gap-2 px-4">
              {data.squads.map((summary) => (
                <li key={summary.squad.id}>
                  <ListCard
                    href={`/matches/${matchId}/squads/${summary.squad.id}`}
                    number={summary.squad.number}
                    title={t("squads.squad", { number: summary.squad.number })}
                    status={t(`squads.status.${summary.status}` as const)}
                    state={CARD_STATE[summary.status]}
                    lines={[line(summary)]}
                    footer={
                      <ProgressBar value={summary.stagesDone} max={summary.stagesTotal} label={t("squads.progress")} />
                    }
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

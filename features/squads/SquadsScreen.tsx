"use client";

import { useParams } from "next/navigation";
import { Screen } from "@/features/shell/Screen";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { formatMatchCounts } from "@/shared/i18n/format-match";
import { useT } from "@/shared/i18n/useT";
import { ListCard, type ListCardState } from "@/shared/ui/ListCard";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { TabLinks } from "@/shared/ui/TabLinks";
import { loadSquadsOverview, type SquadStatus, type SquadSummary } from "./summary";

const CARD_STATE: Record<SquadStatus, ListCardState> = {
  done: "done",
  onRange: "active",
  notStarted: "idle",
};

export function SquadsScreen() {
  const { t, tEnum } = useT();
  const { matchId } = useParams<{ matchId: string }>();
  const overview = useRepoQuery(["squads", matchId], (repo) => loadSquadsOverview(repo, matchId));

  const line = (summary: SquadSummary) =>
    tEnum("squads.line", summary.status, {
      shooters: t("common.shooterCount", { count: summary.shooters }),
      stage: summary.currentStage?.number ?? "",
      done: summary.stagesDone,
      total: summary.stagesTotal,
    });

  return (
    <Screen
      state={overview}
      header={(data) => ({
        title: data?.match.name ?? "",
        subtitle: data
          ? formatMatchCounts({ stages: data.stageCount, squads: data.squads.length, shooters: data.shooterCount }, t)
          : undefined,
      })}
      back={{ href: "/matches", label: t("squads.back") }}
      headerExtra={
        <TabLinks
          label={t("matchTabs.label")}
          tabs={[
            { href: `/matches/${matchId}`, label: t("matchTabs.squads"), current: true },
            { href: `/matches/${matchId}/roll-call`, label: t("matchTabs.shooters"), current: false },
          ]}
        />
      }
      notFound={t("squads.notFound")}
    >
      {(data) => (
        <main className="flex flex-1 flex-col pb-4">
          <SectionHeader title={t("squads.section")} />
          {data.squads.length === 0 && <p className="px-4 pt-2 text-text-secondary">{t("squads.empty")}</p>}
          <ul className="flex flex-col gap-2 px-4">
            {data.squads.map((summary) => (
              <li key={summary.squad.id}>
                <ListCard
                  href={`/matches/${matchId}/squads/${summary.squad.id}`}
                  number={summary.squad.number}
                  title={t("common.squad", { number: summary.squad.number })}
                  status={tEnum("squads.status", summary.status)}
                  state={CARD_STATE[summary.status]}
                  lines={[line(summary)]}
                  footer={
                    <ProgressBar value={summary.stagesDone} max={summary.stagesTotal} label={t("squads.progress")} />
                  }
                />
              </li>
            ))}
          </ul>
        </main>
      )}
    </Screen>
  );
}

"use client";

import { useParams } from "next/navigation";
import { Screen } from "@/features/shell/Screen";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { useT } from "@/shared/i18n/useT";
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
  const overview = useRepoQuery(["squads", matchId], (repo) => loadSquadsOverview(repo, matchId));

  const line = (summary: SquadSummary) =>
    t(`squads.line.${summary.status}` as const, {
      shooters: t("squads.shooterCount", { count: summary.shooters }),
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
          ? [
              t("squads.stageCount", { count: data.stageCount }),
              t("squads.squadCount", { count: data.squads.length }),
              t("squads.shooterCount", { count: data.shooterCount }),
            ].join(" · ")
          : undefined,
      })}
      back={{ href: "/matches", label: t("squads.back") }}
      notFound={t("squads.notFound")}
    >
      {(data) => (
        <main className="flex flex-1 flex-col pb-4">
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
        </main>
      )}
    </Screen>
  );
}

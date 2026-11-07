"use client";

import { useParams } from "next/navigation";
import { Screen } from "@/features/shell/Screen";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { useT } from "@/shared/i18n/useT";
import { ListCard, type ListCardState } from "@/shared/ui/ListCard";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { loadSquadsOverview, type StageStatus } from "./summary";

const CARD_STATE: Record<StageStatus, ListCardState> = {
  done: "done",
  inProgress: "active",
  notStarted: "idle",
};

/** The squads on one stage, in squad number order, each with its progress on this stage. */
export function SquadsScreen() {
  const { t, tEnum } = useT();
  const { matchId, stageId } = useParams<{ matchId: string; stageId: string }>();
  const overview = useRepoQuery(["squads", matchId, stageId], (repo) => loadSquadsOverview(repo, matchId, stageId));

  return (
    <Screen
      state={overview}
      header={(data) => ({
        title: data ? t("common.stage", { number: data.stage.number }) : "",
        subtitle: data?.stage.name,
      })}
      back={{ href: `/matches/${matchId}`, label: t("squads.back") }}
      notFound={t("squads.notFound")}
    >
      {(data) => (
        <main className="flex flex-1 flex-col pb-4">
          <SectionHeader
            title={t("squads.section")}
            count={{ done: data.squadsDone, total: data.squads.length, label: t("squads.doneLabel") }}
          />
          {data.squads.length === 0 && <p className="px-4 pt-2 text-text-secondary">{t("squads.empty")}</p>}
          <ul className="flex flex-col gap-2 px-4">
            {data.squads.map((summary) => (
              <li key={summary.squad.id}>
                <ListCard
                  href={`/matches/${matchId}/stages/${stageId}/squads/${summary.squad.id}`}
                  number={summary.squad.number}
                  title={t("common.squad", { number: summary.squad.number })}
                  status={tEnum("progress.status", summary.status)}
                  state={CARD_STATE[summary.status]}
                  lines={[
                    `${t("common.shooterCount", { count: summary.shooters })} · ${t("squads.scored", { scored: summary.scored, total: summary.total })}`,
                  ]}
                  footer={<ProgressBar value={summary.scored} max={summary.total} label={t("squads.progress")} />}
                />
              </li>
            ))}
          </ul>
        </main>
      )}
    </Screen>
  );
}

"use client";

import { useParams } from "next/navigation";
import { Screen } from "@/features/shell/Screen";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { formatStageTargets } from "@/shared/i18n/format-stage";
import { formatMatchCounts } from "@/shared/i18n/format-match";
import { useT } from "@/shared/i18n/useT";
import { ListCard, type ListCardState } from "@/shared/ui/ListCard";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { TabLinks } from "@/shared/ui/TabLinks";
import { loadStagesOverview, type StageStatus } from "./summary";

const CARD_STATE: Record<StageStatus, ListCardState> = {
  done: "done",
  inProgress: "active",
  notStarted: "idle",
};

/** The match view: every stage with its progress over all squads. A stage leads to its squads. */
export function StagesScreen() {
  const { t, tEnum } = useT();
  const { matchId } = useParams<{ matchId: string }>();
  const overview = useRepoQuery(["stages", matchId], (repo) => loadStagesOverview(repo, matchId));

  return (
    <Screen
      state={overview}
      header={(data) => ({
        title: data?.match.name ?? "",
        subtitle: data
          ? formatMatchCounts({ stages: data.stages.length, squads: data.squadCount, shooters: data.shooterCount }, t)
          : undefined,
      })}
      back={{ href: "/matches", label: t("stages.back") }}
      headerExtra={
        <TabLinks
          label={t("matchTabs.label")}
          tabs={[
            { href: `/matches/${matchId}`, label: t("matchTabs.stages"), current: true },
            { href: `/matches/${matchId}/roll-call`, label: t("matchTabs.shooters"), current: false },
          ]}
        />
      }
      notFound={t("stages.notFound")}
    >
      {(data) => (
        <main className="flex flex-1 flex-col pb-4">
          <SectionHeader
            title={t("stages.section")}
            count={{ done: data.stagesDone, total: data.stages.length, label: t("stages.doneLabel") }}
          />
          {data.stages.length === 0 && <p className="px-4 pt-2 text-text-secondary">{t("stages.empty")}</p>}
          <ul className="flex flex-col gap-2 px-4">
            {data.stages.map((summary) => (
              <li key={summary.stage.id}>
                <ListCard
                  href={`/matches/${matchId}/stages/${summary.stage.id}`}
                  number={summary.stage.number}
                  title={summary.stage.name}
                  status={tEnum("progress.status", summary.status)}
                  state={CARD_STATE[summary.status]}
                  lines={[
                    formatStageTargets(summary.stage, t),
                    t("stages.minRounds", { count: summary.stage.minRounds }),
                    t("stages.scored", { scored: summary.scored, total: summary.total }),
                  ]}
                  footer={<ProgressBar value={summary.scored} max={summary.total} label={t("stages.progress")} />}
                />
              </li>
            ))}
          </ul>
        </main>
      )}
    </Screen>
  );
}

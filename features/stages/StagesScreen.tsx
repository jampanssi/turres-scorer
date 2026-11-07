"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Screen } from "@/features/shell/Screen";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { canCompleteMatch, isCompleted, visibilityOf } from "@/shared/domain/match-state";
import { formatDate } from "@/shared/i18n/format";
import { formatStageTargets } from "@/shared/i18n/format-stage";
import { formatMatchCounts } from "@/shared/i18n/format-match";
import { useT } from "@/shared/i18n/useT";
import { Button } from "@/shared/ui/Button";
import { CheckIcon } from "@/shared/ui/icons";
import { ListCard, type ListCardState } from "@/shared/ui/ListCard";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { TabLinks } from "@/shared/ui/TabLinks";
import { CompleteMatchSheet } from "./CompleteMatchSheet";
import { loadStagesOverview, type StagesOverview, type StageStatus } from "./summary";
import { useCompleteMatch } from "./useCompleteMatch";

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
          <MatchCompletion data={data} matchId={matchId} />
        </main>
      )}
    </Screen>
  );
}

/** Under the stage list: the Complete match button while the match is live, the status once it is completed. */
function MatchCompletion({ data, matchId }: { data: StagesOverview; matchId: string }) {
  const { t, tEnum } = useT();
  const [open, setOpen] = useState(false);
  const { complete, saving, failed, clearFailure } = useCompleteMatch(matchId, () => setOpen(false));
  const { match } = data;

  if (isCompleted(match)) {
    return (
      <p className="mx-4 mt-4 flex items-start gap-2 rounded-input bg-success-tint px-3 py-3 text-sm font-semibold text-success-text">
        <CheckIcon width={20} height={20} className="mt-px shrink-0" />
        {t("match.completedLine", {
          date: formatDate(match.completedAt ?? match.date),
          visibility: tEnum("match.visibility", visibilityOf(match)),
        })}
      </p>
    );
  }
  if (match.status !== "live") return null; // an upcoming match has nothing to complete yet

  const ready = canCompleteMatch(data.stages);

  return (
    <div className="px-4 pt-4">
      <Button
        variant="outline"
        className="w-full"
        disabled={!ready}
        aria-describedby={ready ? undefined : "complete-blocked"}
        onClick={() => setOpen(true)}
      >
        {t("match.complete.button")}
      </Button>
      {!ready && (
        <p id="complete-blocked" className="mt-2 text-center text-sm text-text-secondary">
          {t("match.complete.blocked", { done: data.stagesDone, total: data.stages.length })}
        </p>
      )}
      {open && (
        <CompleteMatchSheet
          subtitle={match.name}
          onCancel={() => {
            setOpen(false);
            clearFailure();
          }}
          onConfirm={complete}
          saving={saving}
          saveFailed={failed}
        />
      )}
    </div>
  );
}

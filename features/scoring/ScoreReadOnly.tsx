"use client";

import type { DnfStageScore, DqStageScore, Stage, StageScore } from "@/shared/domain/types";
import { useT } from "@/shared/i18n/useT";
import { Button } from "@/shared/ui/Button";
import { draftFromScore } from "./draft";
import { summarizeDraft } from "./review";
import { ScoreSummary, SummaryCard } from "./ScoreSummary";

interface ScoreReadOnlyProps {
  /** The saved result of this shooter on this stage. */
  existing: StageScore;
  stage: Stage;
  /** Switch to the entry form to correct the result. Omitted for a completed match: no Edit button. */
  onEdit?: () => void;
}

/**
 * A saved result, read only: the same summary as the Review sheet (or the outcome, for a DNF), and
 * an Edit button at the bottom (left out when the match is completed). There are no DQ, DNF or Review buttons until the user taps Edit.
 */
export function ScoreReadOnly({ existing, stage, onEdit }: ScoreReadOnlyProps) {
  const { t } = useT();

  return (
    <>
      <main className="flex flex-1 flex-col gap-2.5 p-4">
        {existing.status === "scored" ? (
          <ScoreSummary
            draft={draftFromScore(existing, stage)}
            hitsPerPaperTarget={stage.hitsPerPaperTarget}
            summary={summarizeDraft(draftFromScore(existing, stage), stage)}
          />
        ) : (
          <Outcome existing={existing} />
        )}
      </main>

      {onEdit && (
        <div className="sticky bottom-0 z-10 border-t border-border-light bg-surface px-3 pb-4 pt-2 shadow-bar">
          <Button variant="outline" className="w-full" onClick={onEdit}>
            {t("score.edit")}
          </Button>
        </div>
      )}
    </>
  );
}

/** A saved DNF (or DQ): the outcome, the reason and the note. These results have no time or hits. */
function Outcome({ existing }: { existing: DnfStageScore | DqStageScore }) {
  const { t, tEnum } = useT();
  const disqualified = existing.status === "dq";
  const reason =
    existing.status === "dq" ? tEnum("reason.dq", existing.dqReason) : tEnum("reason.dnf", existing.dnfReason);

  return (
    <>
      <div className="flex flex-col gap-0.5 rounded-card bg-primary px-3.5 py-3 text-white">
        <span className="text-xs text-on-primary-muted">{t("score.result")}</span>
        <span className="font-display text-[28px] font-bold leading-none">
          {t(disqualified ? "common.dq" : "common.dnf")}
        </span>
      </div>
      <SummaryCard title={t(disqualified ? "common.reason" : "common.reason")}>
        <p className="text-base">{reason}</p>
      </SummaryCard>
      {existing.note && (
        <SummaryCard title={t("dq.note")}>
          <p className="whitespace-pre-wrap text-base">{existing.note}</p>
        </SummaryCard>
      )}
    </>
  );
}

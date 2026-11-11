"use client";

import { useEffect, useMemo, useState } from "react";
import { maxNoShoots, maxProcedurals } from "@/shared/domain/scoring";
import type { DnfReason, DqReason } from "@/shared/domain/types";
import { useT } from "@/shared/i18n/useT";
import { ConfirmDnfSheet } from "./ConfirmDnfSheet";
import { ConfirmDqSheet } from "./ConfirmDqSheet";
import type { ScoringContext } from "./context";
import {
  appendTimeDigit,
  backspaceTimeDigit,
  clearTimeDigits,
  draftFromScore,
  isSameDraft,
  setNoShoots,
  setProcedurals,
  tapPaper,
  tapSteel,
  type ScoreDraft,
  undoPaper,
  undoSteel,
} from "./draft";
import { buildDnfScore, buildDqScore } from "./outcome";
import { ReviewSheet } from "./ReviewSheet";
import { buildStageScore, summarizeDraft } from "./review";
import { ScoreBar } from "./ScoreBar";
import { ScoreMatrix } from "./ScoreMatrix";
import { TimeCard } from "./TimeCard";
import { useSaveResult } from "./useSaveResult";

export interface ScoringFormProps {
  data: ScoringContext;
  matchId: string;
  /** The signed-in range officer, recorded on the saved result. */
  roId: string;
  /** The shooter list: where to go after saving. */
  backHref: string;
  /** Told whenever the entry differs from where it started (a saved score, or empty), so leaving can ask first. */
  onDirtyChange: (dirty: boolean) => void;
  /** Set when correcting a saved score: go back to the read-only view. */
  onCancelEdit?: () => void;
}

/**
 * The entry form: time keypad, target matrix, penalty steppers and the Review, DNF and DQ sheets.
 * Mounted only once the data is loaded, so the draft starts from the saved score (if any).
 */
export function ScoringForm({ data, matchId, roId, backHref, onDirtyChange, onCancelEdit }: ScoringFormProps) {
  const { t } = useT();
  const { stage, shooter, squad } = data;
  const [initial] = useState<ScoreDraft>(() => draftFromScore(data.existing, stage));
  const [draft, setDraft] = useState<ScoreDraft>(initial);
  const [sheet, setSheet] = useState<"review" | "dnf" | "dq" | null>(null);
  const dirty = !isSameDraft(draft, initial);

  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);
  const { saving, saveFailed, persist, clearFailure } = useSaveResult({ backHref, shooter });
  const summary = useMemo(() => summarizeDraft(draft, stage), [draft, stage]);

  const closeSheet = () => {
    setSheet(null);
    clearFailure();
  };

  const who = { matchId, stageId: stage.id, shooterId: shooter.id, roId, existing: data.existing };
  const saveScore = () => persist((now) => buildStageScore({ ...who, draft, now }));
  const confirmDnf = (reason: DnfReason) => persist((now) => buildDnfScore({ ...who, reason, now }));
  const confirmDq = (reason: DqReason, note: string) => persist((now) => buildDqScore({ ...who, reason, note, now }));

  const stageLabel = t("common.stage", { number: stage.number });
  const shooterLine = `${shooter.name} · #${shooter.competitorNumber}`;

  return (
    <>
      <main className="flex flex-1 flex-col gap-3 p-4">
        {onCancelEdit && (
          <div className="flex items-center justify-between gap-3 rounded-input bg-primary-tint px-3 py-1 text-primary-text">
            <span className="text-sm font-semibold">{t("score.editing")}</span>
            <button
              type="button"
              onClick={onCancelEdit}
              className="min-h-touch shrink-0 px-1 text-sm font-bold underline"
            >
              {t("score.cancelEdit")}
            </button>
          </div>
        )}
        <TimeCard
          digits={draft.timeDigits}
          onDigit={(digit) => setDraft((d) => appendTimeDigit(d, digit))}
          onBackspace={() => setDraft((d) => backspaceTimeDigit(d))}
          onClear={() => setDraft((d) => clearTimeDigits(d))}
        />
        <ScoreMatrix
          paper={draft.paper}
          hitsPerPaperTarget={stage.hitsPerPaperTarget}
          steel={draft.steel}
          onPaperTap={(row, hit) => setDraft((d) => tapPaper(d, row, hit, stage.hitsPerPaperTarget))}
          onPaperUndo={(row) => setDraft((d) => undoPaper(d, row))}
          onSteelTap={(row, hit) => setDraft((d) => tapSteel(d, row, hit))}
          onSteelUndo={(row) => setDraft((d) => undoSteel(d, row))}
        />
      </main>

      <ScoreBar
        noShoots={draft.noShoots}
        maxNoShoots={maxNoShoots(stage.noShootTargets)}
        onNoShootsChange={(value) => setDraft((d) => setNoShoots(d, value, stage))}
        procedurals={draft.procedurals}
        maxProcedurals={maxProcedurals(stage.paperTargets, stage.steelTargets, stage.hitsPerPaperTarget)}
        onProceduralsChange={(value) => setDraft((d) => setProcedurals(d, value, stage))}
        onDq={() => setSheet("dq")}
        onDnf={() => setSheet("dnf")}
        onReview={() => setSheet("review")}
        reviewDisabled={!summary.complete}
      />

      {sheet === "review" && (
        <ReviewSheet
          subtitle={`${shooterLine} · ${stageLabel} · ${t("common.squad", { number: squad.number })}`}
          draft={draft}
          hitsPerPaperTarget={stage.hitsPerPaperTarget}
          summary={summary}
          onEdit={closeSheet}
          onAccept={saveScore}
          saving={saving}
          saveFailed={saveFailed}
        />
      )}

      {sheet === "dq" && (
        <ConfirmDqSheet
          subtitle={`${shooterLine} · ${stageLabel}`}
          onCancel={closeSheet}
          onConfirm={confirmDq}
          saving={saving}
          saveFailed={saveFailed}
        />
      )}

      {sheet === "dnf" && (
        <ConfirmDnfSheet
          subtitle={`${shooterLine} · ${stageLabel}`}
          stageLabel={stageLabel}
          onCancel={closeSheet}
          onConfirm={confirmDnf}
          saving={saving}
          saveFailed={saveFailed}
        />
      )}
    </>
  );
}

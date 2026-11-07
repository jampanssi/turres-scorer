"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { UserMenu } from "@/features/auth/UserMenu";
import { useRequireSession } from "@/features/auth/useRequireSession";
import { getRepository } from "@/shared/data";
import { useLoad } from "@/shared/data/useLoad";
import type { DnfReason, DqReason, StageScore } from "@/shared/domain/types";
import { useT } from "@/shared/i18n/useT";
import { AppHeader } from "@/shared/ui/AppHeader";
import { ConfirmDnfSheet } from "./ConfirmDnfSheet";
import { ConfirmDqSheet } from "./ConfirmDqSheet";
import { loadScoringContext, type ScoringContext } from "./context";
import {
  appendTimeDigit,
  backspaceTimeDigit,
  draftFromScore,
  setNoShoots,
  setProcedurals,
  tapPaper,
  tapSteel,
  type ScoreDraft,
  undoPaper,
  undoSteel,
} from "./draft";
import { maxNoShoots, maxProcedurals } from "./rules";
import { buildDnfScore, buildDqScore } from "./outcome";
import { ReviewSheet } from "./ReviewSheet";
import { ScoreReadOnly } from "./ScoreReadOnly";
import { buildStageScore, summarizeDraft } from "./review";
import { ScoreBar } from "./ScoreBar";
import { ScoreMatrix } from "./ScoreMatrix";
import { TimeCard } from "./TimeCard";

export function ScoringScreen() {
  const { t } = useT();
  const { matchId, squadId, stageId, shooterId } = useParams<{
    matchId: string;
    squadId: string;
    stageId: string;
    shooterId: string;
  }>();
  const session = useRequireSession();
  const load = useCallback(
    () => loadScoringContext(getRepository(), matchId, squadId, stageId, shooterId),
    [matchId, squadId, stageId, shooterId],
  );
  const context = useLoad(load);

  if (session.status !== "signedIn") return <div className="min-h-dvh bg-bg" />;

  const data = context.status === "ready" ? context.data : null;
  const backHref = `/matches/${matchId}/squads/${squadId}/stages/${stageId}`;

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <AppHeader
        title={data?.shooter.name ?? ""}
        subtitle={
          data
            ? `#${data.shooter.competitorNumber} · ${t("shooters.stage", { number: data.stage.number })} · ${t("squads.squad", { number: data.squad.number })}`
            : undefined
        }
        back={{ href: backHref, label: t("score.back") }}
        right={<UserMenu />}
      />

      {context.status === "loading" && <p className="px-4 pt-4 text-text-secondary">{t("common.loading")}</p>}
      {context.status === "error" && (
        <p role="alert" className="px-4 pt-4 text-danger-fg">
          {t("common.error")}
        </p>
      )}
      {context.status === "ready" && !data && <p className="px-4 pt-4 text-text-secondary">{t("score.notFound")}</p>}
      {data?.disqualified && <p className="px-4 pt-4 text-text-secondary">{t("score.disqualified")}</p>}
      {data && !data.disqualified && (
        <ScoringBody data={data} matchId={matchId} roId={session.session.email} backHref={backHref} />
      )}
    </div>
  );
}

interface ScoringFormProps {
  data: ScoringContext;
  matchId: string;
  /** The signed-in range officer, recorded on the saved score. */
  roId: string;
  /** The shooter list: where to go after saving. */
  backHref: string;
}

/**
 * A shooter with a saved result opens read only (the summary and an Edit button); a shooter without
 * one opens straight in the entry form. Tapping Edit switches to the form, starting from the saved score.
 */
function ScoringBody(props: ScoringFormProps) {
  const { data } = props;
  const [editing, setEditing] = useState(data.existing === null);

  if (!editing && data.existing) {
    return <ScoreReadOnly existing={data.existing} stage={data.stage} onEdit={() => setEditing(true)} />;
  }
  return <ScoringForm {...props} />;
}

/** The entry form. Mounted only once the data is loaded, so the draft starts from the saved score (if any). */
function ScoringForm({ data, matchId, roId, backHref }: ScoringFormProps) {
  const { t } = useT();
  const router = useRouter();
  const { stage, shooter, squad } = data;
  const [draft, setDraft] = useState<ScoreDraft>(() => draftFromScore(data.existing, stage));
  const [sheet, setSheet] = useState<"review" | "dnf" | "dq" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const closeSheet = () => {
    setSheet(null);
    setSaveFailed(false);
  };

  /** Save a result, then go back to the shooter list. */
  async function persist(score: StageScore) {
    setSaving(true);
    setSaveFailed(false);
    try {
      await getRepository().saveScore(score);
      router.push(backHref); // stay in the "saving" state until the page changes: no double saves
    } catch {
      setSaving(false);
      setSaveFailed(true);
    }
  }

  const now = () => new Date().toISOString();
  const saveScore = () =>
    persist(
      buildStageScore({
        draft,
        matchId,
        stageId: stage.id,
        shooterId: shooter.id,
        roId,
        now: now(),
        existing: data.existing,
      }),
    );
  const confirmDnf = (reason: DnfReason) =>
    persist(
      buildDnfScore({
        matchId,
        stageId: stage.id,
        shooterId: shooter.id,
        roId,
        reason,
        now: now(),
        existing: data.existing,
      }),
    );

  const confirmDq = (reason: DqReason, note: string) =>
    persist(
      buildDqScore({
        matchId,
        stageId: stage.id,
        shooterId: shooter.id,
        roId,
        reason,
        note,
        now: now(),
        existing: data.existing,
      }),
    );

  const stageLabel = t("shooters.stage", { number: stage.number });
  const shooterLine = `${shooter.name} · #${shooter.competitorNumber}`;

  return (
    <>
      <main className="flex flex-1 flex-col gap-3 p-4">
        <TimeCard
          digits={draft.timeDigits}
          onDigit={(digit) => setDraft((d) => appendTimeDigit(d, digit))}
          onBackspace={() => setDraft((d) => backspaceTimeDigit(d))}
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
        reviewDisabled={!summarizeDraft(draft, stage).complete}
      />

      {sheet === "review" && (
        <ReviewSheet
          subtitle={`${shooterLine} · ${stageLabel} · ${t("squads.squad", { number: squad.number })}`}
          draft={draft}
          hitsPerPaperTarget={stage.hitsPerPaperTarget}
          summary={summarizeDraft(draft, stage)}
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

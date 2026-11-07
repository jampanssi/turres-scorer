"use client";

import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { UserMenu } from "@/features/auth/UserMenu";
import { useRequireSession } from "@/features/auth/useRequireSession";
import { getRepository } from "@/shared/data";
import { useLoad } from "@/shared/data/useLoad";
import { useT } from "@/shared/i18n/useT";
import { AppHeader } from "@/shared/ui/AppHeader";
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
      {context.status === "ready" && !data && (
        <p className="px-4 pt-4 text-text-secondary">{t("score.notFound")}</p>
      )}
      {data?.disqualified && <p className="px-4 pt-4 text-text-secondary">{t("score.disqualified")}</p>}
      {data && !data.disqualified && <ScoringForm data={data} />}
    </div>
  );
}

/** The entry form. Mounted only once the data is loaded, so the draft starts from the saved score (if any). */
function ScoringForm({ data }: { data: ScoringContext }) {
  const { stage } = data;
  const [draft, setDraft] = useState<ScoreDraft>(() => draftFromScore(data.existing, stage));

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
          steel={draft.steel}
          onPaperTap={(row, hit) => setDraft((d) => tapPaper(d, row, hit))}
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
        maxProcedurals={maxProcedurals(stage.paperTargets, stage.steelTargets)}
        onProceduralsChange={(value) => setDraft((d) => setProcedurals(d, value, stage))}
        // The DQ, DNF and Review sheets are the next step; until then these buttons do nothing.
        onDq={() => {}}
        onDnf={() => {}}
        onReview={() => {}}
      />
    </>
  );
}

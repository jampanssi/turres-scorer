"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Screen } from "@/features/shell/Screen";
import { useCurrentUser } from "@/features/shell/SessionGate";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { useT } from "@/shared/i18n/useT";
import { loadScoringContext } from "./context";
import { ScoreReadOnly } from "./ScoreReadOnly";
import { DiscardSheet } from "./DiscardSheet";
import { ScoringForm, type ScoringFormProps } from "./ScoringForm";

export function ScoringScreen() {
  const { t } = useT();
  const router = useRouter();
  const user = useCurrentUser();
  const { matchId, squadId, stageId, shooterId } = useParams<{
    matchId: string;
    squadId: string;
    stageId: string;
    shooterId: string;
  }>();
  const context = useRepoQuery(["scoring", matchId, squadId, stageId, shooterId], (repo) =>
    loadScoringContext(repo, matchId, squadId, stageId, shooterId),
  );
  const backHref = `/matches/${matchId}/squads/${squadId}/stages/${stageId}`;

  // Something is typed that is not saved: leaving (the back arrow, closing the tab) asks first.
  const [dirty, setDirty] = useState(false);
  const [pendingExit, setPendingExit] = useState<(() => void) | null>(null);
  const requestExit = useCallback((exit: () => void) => (dirty ? setPendingExit(() => exit) : exit()), [dirty]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <>
      <Screen
        state={context}
        header={(data) => ({
          title: data?.shooter.name ?? "",
          subtitle: data
            ? `#${data.shooter.competitorNumber} · ${t("common.stage", { number: data.stage.number })} · ${t("common.squad", { number: data.squad.number })}`
            : undefined,
        })}
        back={{
          href: backHref,
          label: t("score.back"),
          onClick: (event) => {
            if (!dirty) return;
            event.preventDefault();
            requestExit(() => router.push(backHref));
          },
        }}
        notFound={t("score.notFound")}
      >
        {(data) =>
          data.disqualified || data.notStarting ? (
            <p className="px-4 pt-4 text-text-secondary">
              {t(data.disqualified ? "score.disqualified" : "score.notStarting")}
            </p>
          ) : (
            <ScoringBody
              key={`${stageId}:${shooterId}`}
              data={data}
              matchId={matchId}
              roId={user.userId}
              backHref={backHref}
              onDirtyChange={setDirty}
              requestExit={requestExit}
            />
          )
        }
      </Screen>
      {pendingExit && (
        <DiscardSheet
          onKeep={() => setPendingExit(null)}
          onDiscard={() => {
            const exit = pendingExit;
            setPendingExit(null);
            exit();
          }}
        />
      )}
    </>
  );
}

/**
 * A shooter with a saved result opens read only (the summary and an Edit button); a shooter without
 * one opens straight in the entry form. Tapping Edit switches to the form, starting from the saved score.
 */
function ScoringBody({ requestExit, ...props }: ScoringFormProps & { requestExit: (exit: () => void) => void }) {
  const { data } = props;
  const [editing, setEditing] = useState(data.existing === null);

  if (!editing && data.existing) {
    return <ScoreReadOnly existing={data.existing} stage={data.stage} onEdit={() => setEditing(true)} />;
  }
  return (
    <ScoringForm {...props} onCancelEdit={data.existing ? () => requestExit(() => setEditing(false)) : undefined} />
  );
}

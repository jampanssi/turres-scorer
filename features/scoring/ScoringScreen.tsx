"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Screen } from "@/features/shell/Screen";
import { useCurrentUser } from "@/features/shell/SessionGate";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { useT } from "@/shared/i18n/useT";
import { loadScoringContext } from "./context";
import { ScoreReadOnly } from "./ScoreReadOnly";
import { ScoringForm, type ScoringFormProps } from "./ScoringForm";

export function ScoringScreen() {
  const { t } = useT();
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

  return (
    <Screen
      state={context}
      header={(data) => ({
        title: data?.shooter.name ?? "",
        subtitle: data
          ? `#${data.shooter.competitorNumber} · ${t("common.stage", { number: data.stage.number })} · ${t("common.squad", { number: data.squad.number })}`
          : undefined,
      })}
      back={{ href: backHref, label: t("score.back") }}
      notFound={t("score.notFound")}
    >
      {(data) =>
        data.disqualified ? (
          <p className="px-4 pt-4 text-text-secondary">{t("score.disqualified")}</p>
        ) : (
          <ScoringBody
            key={`${stageId}:${shooterId}`}
            data={data}
            matchId={matchId}
            roId={user.userId}
            backHref={backHref}
          />
        )
      }
    </Screen>
  );
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

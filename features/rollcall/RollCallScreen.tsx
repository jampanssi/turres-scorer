"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Screen } from "@/features/shell/Screen";
import { useCurrentUser } from "@/features/shell/SessionGate";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { isCompleted } from "@/shared/domain/match-state";
import { formatMatchCounts } from "@/shared/i18n/format-match";
import { useT } from "@/shared/i18n/useT";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { TabLinks } from "@/shared/ui/TabLinks";
import { RollCallRow } from "./RollCallRow";
import { ShooterActionsSheet } from "./ShooterActionsSheet";
import { loadRoster, type RosterOverview, type RosterSquad } from "./summary";
import { useRollCallSave } from "./useRollCallSave";

/**
 * The Shooters tab of a match: every squad with its shooters, to mark the ones who did not show (DNS).
 * Everyone else is present, so there is nothing to confirm. Every squad is always shown with its shooters.
 */
export function RollCallScreen() {
  const { t } = useT();
  const { matchId } = useParams<{ matchId: string }>();
  const roster = useRepoQuery(["roster", matchId], (repo) => loadRoster(repo, matchId));

  return (
    <Screen
      state={roster}
      header={(data) => ({
        title: data?.match.name ?? "",
        subtitle: data
          ? formatMatchCounts({ stages: data.stageCount, squads: data.squads.length, shooters: data.shooterCount }, t)
          : undefined,
      })}
      back={{ href: "/matches", label: t("stages.back") }}
      headerExtra={
        <TabLinks
          label={t("matchTabs.label")}
          tabs={[
            { href: `/matches/${matchId}`, label: t("matchTabs.stages"), current: false },
            { href: `/matches/${matchId}/roll-call`, label: t("matchTabs.shooters"), current: true },
          ]}
        />
      }
      notFound={t("stages.notFound")}
    >
      {(data) => <RosterBody data={data} matchId={matchId} />}
    </Screen>
  );
}

function RosterBody({ data, matchId }: { data: RosterOverview; matchId: string }) {
  const { t } = useT();
  const user = useCurrentUser();
  const { setDns, settle, pending, failed } = useRollCallSave(matchId, data.day, user.userId);
  const locked = isCompleted(data.match);
  // The shooter whose actions are open (by id, so the sheet closes by itself if the shooter disappears).
  const [actionsFor, setActionsFor] = useState<string | null>(null);
  const open = data.squads
    .flatMap((s) => s.rows.map((row) => ({ row, squad: s.squad })))
    .find((e) => e.row.shooter.id === actionsFor);

  // Taps show at once; once the loaded data has caught up the pending entry is dropped.
  useEffect(() => {
    settle(new Map(data.squads.flatMap((s) => s.rows.map((row) => [row.shooter.id, row.dns] as const))));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- settle only reads state through its updater
  }, [data.squads]);

  return (
    <main className="flex flex-1 flex-col pb-6">
      <SectionHeader title={t("rollcall.section")} />
      {locked && <p className="px-4 pb-2 text-sm text-text-secondary">{t("rollcall.completed")}</p>}
      {failed && (
        <p
          role="alert"
          className="mx-4 mb-2 rounded-input bg-danger-tint px-3 py-2 text-sm font-semibold text-danger-text"
        >
          {t("common.saveError")}
        </p>
      )}
      {data.squads.length === 0 && <p className="px-4 pt-2 text-text-secondary">{t("squads.empty")}</p>}

      <div className="flex flex-col gap-3 px-4">
        {data.squads.map((entry) => (
          <SquadGroup key={entry.squad.id} entry={entry} pending={pending} locked={locked} onActions={setActionsFor} />
        ))}
      </div>
      {open && (
        <ShooterActionsSheet
          row={{ ...open.row, dns: pending[open.row.shooter.id] ?? open.row.dns }}
          squad={open.squad}
          otherSquads={data.squads
            .filter((s) => s.squad.id !== open.squad.id)
            .map((s) => ({ id: s.squad.id, number: s.squad.number, shooters: s.squad.shooterIds.length }))}
          roId={user.userId}
          onSetDns={(dns) => setDns(open.row.shooter.id, dns)}
          onClose={() => setActionsFor(null)}
        />
      )}
    </main>
  );
}

interface SquadGroupProps {
  entry: RosterSquad;
  pending: Readonly<Record<string, boolean>>;
  locked: boolean;
  onActions: (shooterId: string) => void;
}

function SquadGroup({ entry, pending, locked, onActions }: SquadGroupProps) {
  const { t } = useT();
  const { squad, rows } = entry;
  const headingId = `squad-heading-${squad.id}`;

  return (
    <section aria-labelledby={headingId}>
      <div className="flex min-h-touch items-center justify-between gap-3 py-1">
        <h3 id={headingId} className="font-display text-[22px] font-bold uppercase leading-none">
          {t("common.squad", { number: squad.number })}
        </h3>
        <span className="text-[13px] text-text-secondary">
          {t("common.shooterCount", { count: squad.shooterIds.length })}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.shooter.id}>
            <RollCallRow
              row={{ ...row, dns: pending[row.shooter.id] ?? row.dns }}
              onActions={() => onActions(row.shooter.id)}
              locked={locked}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

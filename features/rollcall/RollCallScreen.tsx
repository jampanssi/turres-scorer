"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Screen } from "@/features/shell/Screen";
import { useCurrentUser } from "@/features/shell/SessionGate";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { formatMatchCounts } from "@/shared/i18n/format-match";
import { useT } from "@/shared/i18n/useT";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { TabLinks } from "@/shared/ui/TabLinks";
import { RollCallRow } from "./RollCallRow";
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
      back={{ href: "/matches", label: t("squads.back") }}
      headerExtra={
        <TabLinks
          label={t("matchTabs.label")}
          tabs={[
            { href: `/matches/${matchId}`, label: t("matchTabs.squads"), current: false },
            { href: `/matches/${matchId}/roll-call`, label: t("matchTabs.shooters"), current: true },
          ]}
        />
      }
      notFound={t("squads.notFound")}
    >
      {(data) => <RosterBody data={data} matchId={matchId} />}
    </Screen>
  );
}

function RosterBody({ data, matchId }: { data: RosterOverview; matchId: string }) {
  const { t } = useT();
  const user = useCurrentUser();
  const { setDns, settle, pending, failed } = useRollCallSave(matchId, data.day, user.userId);

  // Taps show at once; once the loaded data has caught up the pending entry is dropped.
  useEffect(() => {
    settle(new Map(data.squads.flatMap((s) => s.rows.map((row) => [row.shooter.id, row.dns] as const))));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- settle only reads state through its updater
  }, [data.squads]);

  return (
    <main className="flex flex-1 flex-col pb-6">
      <SectionHeader title={t("rollcall.section")} />
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
          <SquadGroup key={entry.squad.id} entry={entry} pending={pending} onToggleDns={setDns} />
        ))}
      </div>
    </main>
  );
}

interface SquadGroupProps {
  entry: RosterSquad;
  pending: Readonly<Record<string, boolean>>;
  onToggleDns: (shooterId: string, dns: boolean) => void;
}

function SquadGroup({ entry, pending, onToggleDns }: SquadGroupProps) {
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
              onToggle={(dns) => onToggleDns(row.shooter.id, dns)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

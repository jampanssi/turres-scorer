"use client";

import { useMemo, useState } from "react";
import { UserMenu } from "@/features/auth/UserMenu";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { useT } from "@/shared/i18n/useT";
import { useRequireSession } from "@/features/auth/useRequireSession";
import { AppHeader } from "@/shared/ui/AppHeader";
import { Segmented } from "@/shared/ui/Segmented";
import { MatchCard } from "./MatchCard";
import { loadMatchSummaries, type MatchTab, summariesForTab } from "./summary";

export function MatchesScreen() {
  const { t } = useT();
  const sessionState = useRequireSession();
  const [tab, setTab] = useState<MatchTab>("open");
  const summaries = useRepoQuery(["matches"], loadMatchSummaries);

  const visible = useMemo(
    () => (summaries.status === "ready" ? summariesForTab(summaries.data, tab) : []),
    [summaries, tab],
  );

  // Signed-out visitors are sent to Sign in; render nothing meanwhile instead of flashing the list.
  if (sessionState.status !== "signedIn") return <div className="min-h-dvh bg-bg" />;

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <AppHeader title={t("matches.title")} right={<UserMenu />}>
        <Segmented
          label={t("matches.tabs")}
          value={tab}
          onChange={setTab}
          options={[
            { value: "open", label: t("matches.tab.open") },
            { value: "results", label: t("matches.tab.results") },
          ]}
        />
      </AppHeader>

      <main className="flex flex-1 flex-col gap-3 p-4">
        {summaries.status === "loading" && <p className="text-text-secondary">{t("matches.loading")}</p>}
        {summaries.status === "error" && (
          <p role="alert" className="text-danger-fg">
            {t("matches.error")}
          </p>
        )}
        {summaries.status === "ready" && visible.length === 0 && (
          <p className="text-text-secondary">{t(tab === "open" ? "matches.empty.open" : "matches.empty.results")}</p>
        )}
        {visible.map((summary) => (
          <MatchCard key={summary.match.id} summary={summary} />
        ))}
      </main>
    </div>
  );
}

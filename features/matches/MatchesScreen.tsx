"use client";

import { useState } from "react";
import { Screen } from "@/features/shell/Screen";
import { useRepoQuery } from "@/shared/data/useRepoQuery";
import { useT } from "@/shared/i18n/useT";
import { Segmented } from "@/shared/ui/Segmented";
import { MatchCard } from "./MatchCard";
import { loadMatchSummaries, type MatchTab, summariesForTab } from "./summary";

export function MatchesScreen() {
  const { t } = useT();
  const [tab, setTab] = useState<MatchTab>("open");
  const matches = useRepoQuery(["matches"], loadMatchSummaries);

  return (
    <Screen
      state={matches}
      header={() => ({ title: t("matches.title") })}
      headerExtra={
        <Segmented
          label={t("matches.tabs")}
          value={tab}
          onChange={setTab}
          options={[
            { value: "open", label: t("matches.tab.open") },
            { value: "results", label: t("matches.tab.results") },
          ]}
        />
      }
    >
      {(summaries) => {
        const visible = summariesForTab(summaries, tab);
        return (
          <main className="flex flex-1 flex-col gap-3 p-4">
            {visible.length === 0 && (
              <p className="text-text-secondary">
                {t(tab === "open" ? "matches.empty.open" : "matches.empty.results")}
              </p>
            )}
            {visible.map((summary) => (
              <MatchCard key={summary.match.id} summary={summary} />
            ))}
          </main>
        );
      }}
    </Screen>
  );
}

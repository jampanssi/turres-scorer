"use client";

import { useEffect, useRef, useState } from "react";
import { getRepository, type Repository } from "./index";

export type QueryState<T> =
  { status: "loading" } | { status: "error"; retry: () => void } | { status: "ready"; data: T };

const LOADING: QueryState<never> = { status: "loading" };

/**
 * Read data through the repository from a Client Component.
 *
 * - `key` identifies the query (for example `["squads", matchId]`). When it changes the state goes back
 *   to loading, so a screen never shows the previous record's data for a new one.
 * - It refetches whenever the repository reports a change (a result was saved, later a sync arrived),
 *   keeping the old data on screen meanwhile (no flash of "loading"); if that refetch fails, the old
 *   data stays.
 * - On an error the state carries `retry()`, which shows loading again and asks once more.
 * - Only the latest request counts: a slow, older answer cannot overwrite a newer one.
 *
 * `fetcher` may be an inline function: the latest one is used, and changing it does not refetch.
 */
export function useRepoQuery<T>(
  key: readonly (string | number)[],
  fetcher: (repo: Repository) => Promise<T>,
): QueryState<T> {
  const keyId = JSON.stringify(key);
  const fetcherRef = useRef(fetcher);
  const [result, setResult] = useState<{ key: string; state: QueryState<T> } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let active = true;
    let latest = 0;
    let unsubscribe: (() => void) | undefined;
    const retry = () => {
      setResult(null);
      setAttempt((n) => n + 1);
    };

    const load = () => {
      const request = ++latest;
      getRepository()
        .then((repo) => fetcherRef.current(repo))
        .then(
          (data) => {
            if (active && request === latest) setResult({ key: keyId, state: { status: "ready", data } });
          },
          () => {
            if (!active || request !== latest) return;
            setResult((previous) =>
              previous?.key === keyId && previous.state.status === "ready"
                ? previous
                : { key: keyId, state: { status: "error", retry } },
            );
          },
        );
    };

    load();
    getRepository().then(
      (repo) => {
        if (active) unsubscribe = repo.subscribe(load);
      },
      () => {}, // the failure is reported by load()
    );

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [keyId, attempt]);

  return result?.key === keyId ? result.state : LOADING;
}

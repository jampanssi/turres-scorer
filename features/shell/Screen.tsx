"use client";

import type { ComponentProps, ReactNode } from "react";
import { UserMenu } from "@/features/auth/UserMenu";
import type { QueryState } from "@/shared/data/useRepoQuery";
import { useT } from "@/shared/i18n/useT";
import { AppHeader } from "@/shared/ui/AppHeader";
import { Button } from "@/shared/ui/Button";

interface ScreenProps<T> {
  /**
   * The screen's query (`useRepoQuery`). A `null` result means the thing in the URL does not exist
   * (for example an unknown squad id), which shows `notFound`.
   */
  state: QueryState<T | null>;
  /** The header text. `data` is null until the query is ready; return an empty title meanwhile. */
  header: (data: T | null) => { title: string; subtitle?: string };
  /** Back arrow in the header; omit on the first screen. */
  back?: ComponentProps<typeof AppHeader>["back"];
  /** Content under the title row in the header, such as the Open | Results tabs. */
  headerExtra?: ReactNode;
  /** Message for a `null` result. */
  notFound?: string;
  /** The screen's content, rendered only once there is data (typically a `<main>`). */
  children: (data: T) => ReactNode;
}

/**
 * The frame shared by every signed-in screen: the sticky header with the user menu, and the
 * loading, error and not-found messages. A screen supplies its query, its header text and its content.
 */
export function Screen<T>({ state, header, back, headerExtra, notFound, children }: ScreenProps<T>) {
  const { t } = useT();
  const data = state.status === "ready" ? state.data : null;
  const { title, subtitle } = header(data);

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <AppHeader title={title} subtitle={subtitle} back={back} right={<UserMenu />}>
        {headerExtra}
      </AppHeader>

      {state.status === "loading" && <p className="px-4 pt-4 text-text-secondary">{t("common.loading")}</p>}
      {state.status === "error" && (
        <div role="alert" className="flex flex-col items-start gap-3 px-4 pt-4">
          <p className="text-danger-fg">{t("common.error")}</p>
          <Button variant="outline" onClick={state.retry}>
            {t("status.retry")}
          </Button>
        </div>
      )}
      {state.status === "ready" && data === null && notFound && (
        <p className="px-4 pt-4 text-text-secondary">{notFound}</p>
      )}
      {data !== null && children(data)}
    </div>
  );
}

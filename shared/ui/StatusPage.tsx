"use client";

import { type ReactNode, useEffect } from "react";
import { useT } from "@/shared/i18n/useT";
import { Button, ButtonLink } from "./Button";

function StatusLayout({ title, message, children }: { title: string; message: string; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-text">
      <h1 className="font-display text-[32px] font-bold uppercase leading-none">{title}</h1>
      <p className="max-w-xs text-base text-text-secondary">{message}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">{children}</div>
    </main>
  );
}

/**
 * Body of `app/error.tsx`: an unexpected error in a screen. `retry` is the Next.js error boundary
 * prop that re-renders the segment; the error is logged for now (an error reporting service can
 * replace the console later).
 */
export function ErrorStatus({ error, retry }: { error: unknown; retry: () => void }) {
  const { t } = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusLayout title={t("status.errorTitle")} message={t("status.errorMessage")}>
      <Button onClick={retry}>{t("status.retry")}</Button>
      <ButtonLink href="/matches" variant="outline">
        {t("status.home")}
      </ButtonLink>
    </StatusLayout>
  );
}

/** Body of `app/not-found.tsx`: a URL that does not exist. */
export function NotFoundStatus() {
  const { t } = useT();

  return (
    <StatusLayout title={t("status.notFoundTitle")} message={t("status.notFoundMessage")}>
      <ButtonLink href="/matches">{t("status.home")}</ButtonLink>
    </StatusLayout>
  );
}

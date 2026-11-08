"use client";

import type { AnchorHTMLAttributes } from "react";
import { useT } from "@/shared/i18n/useT";
import { cx } from "./cx";

/**
 * A link to another site, opened outside the app: `target="_blank"` makes the browser open it instead of
 * replacing the app's page, which also holds when the app is installed as a PWA (the system decides
 * where it opens: Safari on iOS, a browser tab or in-app browser view on Android). `noopener` and
 * `noreferrer` keep the other site from reaching back. The tap target is at least 44 px tall, and
 * screen readers are told that it leaves the app.
 */
export function ExternalLink({ className, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { t } = useT();
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cx("inline-flex min-h-touch items-center underline", className)}
      {...props}
    >
      {children}
      <span className="sr-only"> {t("common.opensInBrowser")}</span>
    </a>
  );
}

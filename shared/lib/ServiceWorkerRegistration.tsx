"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Registers `public/sw.js` once the page has loaded. Only in production builds: in `next dev` a service
 * worker would serve stale files and hide changes. It also tells the worker which page is showing
 * (`cache-page`), so a page reached by tapping inside the app can be opened offline later. Renders nothing. A failed registration is ignored:
 * the app works the same without a service worker.
 */
export function ServiceWorkerRegistration() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    // `ready` waits for an active worker, so the first page is stored too.
    navigator.serviceWorker.ready
      .then((registration) => registration.active?.postMessage({ type: "cache-page", path: pathname }))
      .catch(() => {});
  }, [pathname]);

  return null;
}

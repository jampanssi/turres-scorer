"use client";

import { useEffect, useState } from "react";

export type LoadState<T> = { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

/**
 * Run an async loader in the browser and expose its state. `load` must be stable across renders
 * (define it outside the component or wrap it in useCallback), because a new function reloads.
 */
export function useLoad<T>(load: () => Promise<T>): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => !cancelled && setState({ status: "ready", data }),
      () => !cancelled && setState({ status: "error" }),
    );
    return () => {
      cancelled = true;
    };
  }, [load]);

  return state;
}

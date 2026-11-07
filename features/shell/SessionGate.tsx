"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { Session } from "@/features/auth/session";
import { useRequireSession } from "@/features/auth/useRequireSession";

const SessionContext = createContext<Session | null>(null);

/**
 * The one sign-in guard for every signed-in screen (used by `app/(app)/layout.tsx`). Signed-out
 * visitors are sent to Sign in; until then nothing but an empty page is shown, so a protected screen
 * never flashes. Because it lives in a layout it stays mounted while moving between screens.
 * Descendants read the signed-in user with `useCurrentUser()`, never the "not signed in" case.
 */
export function SessionGate({ children }: { children: ReactNode }) {
  const state = useRequireSession();
  if (state.status !== "signedIn") return <div className="min-h-dvh bg-bg" />;
  return <SessionContext.Provider value={state.session}>{children}</SessionContext.Provider>;
}

/** The signed-in user. Only available below `SessionGate`. */
export function useCurrentUser(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useCurrentUser must be used inside SessionGate (the signed-in area)");
  return session;
}

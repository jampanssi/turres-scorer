"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseSession, readSessionRaw, type Session, subscribeSession } from "./session";

export type SessionState =
  | { status: "loading" } // server render / first client render, before localStorage can be read
  | { status: "signedOut" }
  | { status: "signedIn"; session: Session };

const SERVER_SNAPSHOT = "\u0000server";

export function useSession(): SessionState {
  const raw = useSyncExternalStore(subscribeSession, () => readSessionRaw() ?? "", () => SERVER_SNAPSHOT);
  return useMemo<SessionState>(() => {
    if (raw === SERVER_SNAPSHOT) return { status: "loading" };
    const session = parseSession(raw);
    return session ? { status: "signedIn", session } : { status: "signedOut" };
  }, [raw]);
}

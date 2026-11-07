"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { type SessionState, useSession } from "./useSession";

/**
 * Session guard for signed-in screens: sends signed-out visitors to Sign in. Render nothing
 * (or a blank page) while the returned status is not "signedIn".
 */
export function useRequireSession(): SessionState {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status === "signedOut") router.replace("/");
  }, [session.status, router]);

  return session;
}

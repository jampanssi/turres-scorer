import type { ReactNode } from "react";
import { SessionGate } from "@/features/shell/SessionGate";

/** Every screen after Sign in: one session gate for all of them (route groups do not change the URLs). */
export default function SignedInLayout({ children }: { children: ReactNode }) {
  return <SessionGate>{children}</SessionGate>;
}

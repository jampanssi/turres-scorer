import type { Viewport } from "next";
import { SignInScreen } from "@/features/auth/SignInScreen";

// Sign in has a full blue background (always light), so the browser bar is blue here.
export const viewport: Viewport = { themeColor: "#005185" };

export default function SignInPage() {
  return <SignInScreen />;
}

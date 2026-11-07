"use client";

import Image from "next/image";
import { LanguageToggle } from "@/shared/i18n/LanguageToggle";
import { useT } from "@/shared/i18n/useT";
import { SignInForm } from "./SignInForm";

/** Sign in is always light: data-theme="light" resets the palette for this subtree, whatever the saved theme. */
export function SignInScreen() {
  const { t } = useT();
  return (
    <main data-theme="light" className="relative flex min-h-dvh flex-1 flex-col bg-primary">
      <div className="absolute right-3 top-3 flex">
        <LanguageToggle />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center text-white">
        <Image src="/logo.png" alt="Turun Reserviläiset ry" width={104} height={104} priority />
        <h1 className="mt-6 font-display text-[40px] font-bold uppercase leading-none tracking-[1px]">TurRes Scorer</h1>
        <p className="mt-2 text-base text-on-primary-muted">{t("auth.poweredBy")}</p>
      </div>

      <section aria-labelledby="sign-in-title" className="rounded-t-3xl bg-surface px-6 pb-8 pt-8 text-text">
        <div className="mx-auto w-full max-w-sm">
          <h2 id="sign-in-title" className="mb-5 font-display text-[32px] font-bold uppercase leading-none">
            {t("auth.title")}
          </h2>
          <SignInForm />
        </div>
      </section>
    </main>
  );
}

"use client";

import Image from "next/image";
import { LanguageToggle } from "@/shared/i18n/LanguageToggle";
import { useT } from "@/shared/i18n/useT";
import { ExternalLink } from "@/shared/ui/ExternalLink";
import { SignInForm } from "./SignInForm";

/** The data source's site, linked from the sub-line under the app name. */
const SSI_URL = "https://www.shootnscoreit.com/";
const SSI_NAME = "Shoot'n Score It";

/** Sign in is always light: data-theme="light" resets the palette for this subtree, whatever the saved theme. */
export function SignInScreen() {
  const { t } = useT();
  // "Integrated with {service}": the service name is the link, so split the sentence around it.
  const [before, after] = t("auth.integratedWith", { service: "{service}" }).split("{service}");
  return (
    <main data-theme="light" className="relative flex min-h-dvh flex-1 flex-col bg-primary">
      <div className="absolute right-3 top-3 flex">
        <LanguageToggle />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center text-white">
        <Image src="/logo.png" alt="Turun Reserviläiset ry" width={104} height={104} priority />
        <h1 className="mt-6 font-display text-[40px] font-bold uppercase leading-none tracking-[1px]">TurRes Scorer</h1>
        <p lang="en" className="-mt-1.5 flex flex-wrap items-center justify-center text-sm text-on-primary-muted">
          <span>{before}</span>
          <ExternalLink href={SSI_URL} className="px-1 font-semibold text-white">
            {SSI_NAME}
          </ExternalLink>
          <span>{after}</span>
        </p>
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

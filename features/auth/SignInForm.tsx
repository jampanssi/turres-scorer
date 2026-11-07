"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { useT } from "@/shared/i18n/useT";
import { Button } from "@/shared/ui/Button";
import { type SignInError, signIn } from "./session";

const INPUT =
  "h-[50px] w-full rounded-input border-[1.5px] border-border bg-surface px-4 text-base text-text placeholder:text-disabled";

export function SignInForm() {
  const router = useRouter();
  const { t } = useT();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  // Stored as a code so the message re-translates if the language changes.
  const [error, setError] = useState<SignInError | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const result = await signIn(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
    if (result.ok) {
      router.push("/matches");
    } else {
      setError(result.error);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor={emailId} className="mb-1.5 block text-sm font-bold text-text-label">
          {t("auth.email")}
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder={t("auth.emailPlaceholder")}
          aria-describedby={error ? errorId : undefined}
          className={INPUT}
        />
      </div>
      <div>
        <label htmlFor={passwordId} className="mb-1.5 block text-sm font-bold text-text-label">
          {t("auth.password")}
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          aria-describedby={error ? errorId : undefined}
          className={INPUT}
        />
      </div>

      <div className="flex justify-end">
        {/* Inert until an auth provider exists (see docs/PLAN.md open questions). */}
        <button type="button" className="min-h-11 px-1 text-[15px] font-bold text-primary-text underline">
          {t("auth.forgot")}
        </button>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="rounded-input bg-danger-tint px-3 py-2 text-sm font-semibold text-danger-text"
        >
          {t(`auth.error.${error}` as const)}
        </p>
      )}

      <Button type="submit" disabled={busy} className="w-full min-h-[54px] text-[22px]">
        {t("auth.submit")}
      </Button>
    </form>
  );
}

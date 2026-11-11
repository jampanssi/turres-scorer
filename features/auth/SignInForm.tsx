"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useT } from "@/shared/i18n/useT";
import { Button } from "@/shared/ui/Button";
import { Field, TextInput } from "@/shared/ui/form";
import { showToast } from "@/shared/ui/toast";
import { signIn } from "./session";

export function SignInForm() {
  const router = useRouter();
  const { t, tEnum } = useT();
  // After a failed sign-in the fields are marked invalid (a red border) until the user types again. The
  // message itself is a toast, so it never pushes the form around.
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setFailed(false);
    const result = await signIn(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
    if (result.ok) {
      router.push("/matches");
    } else {
      setFailed(true);
      showToast({ tone: "danger", title: t("auth.failedTitle"), message: tEnum("auth.error", result.error) });
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} onInput={() => setFailed(false)} noValidate className="flex flex-col gap-4">
      <Field label={t("auth.email")}>
        {(control) => (
          <TextInput
            {...control}
            aria-invalid={failed}
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            placeholder={t("auth.emailPlaceholder")}
          />
        )}
      </Field>
      <Field label={t("auth.password")}>
        {(control) => (
          <TextInput
            {...control}
            aria-invalid={failed}
            name="password"
            type="password"
            autoComplete="current-password"
          />
        )}
      </Field>

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? t("auth.busy") : t("auth.submit")}
      </Button>
    </form>
  );
}

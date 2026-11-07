/**
 * English: the source of truth for message keys. Every key here must exist in fi.ts
 * (the type of fi.ts enforces it). Placeholders use {name}. For plurals add
 * `key.one` and `key.other` and call t("key", { count }).
 */
export const en = {
  "auth.title": "Sign in",
  "auth.email": "Email",
  "auth.emailPlaceholder": "name@example.fi",
  "auth.password": "Password",
  "auth.forgot": "Forgot password?",
  "auth.submit": "Sign in",
  "auth.poweredBy": "Powered by SSI",
  "auth.error.invalidEmail": "Enter a valid email address.",
  "auth.error.missingPassword": "Enter your password.",

  "theme.label": "Theme: {current}. Switch to {next}.",
  "theme.system": "system",
  "theme.light": "light",
  "theme.dark": "dark",

  "language.label": "Language: {current}. Switch to {next}.",

  "stepper.max": "Max {max}",
  "stepper.decrease": "Decrease {label}",
  "stepper.increase": "Increase {label}",
  "stepper.count": "{label} count",

  "reason.dq.unsafe_handling": "Unsafe gun handling",
  "reason.dq.accidental_discharge": "Accidental discharge",
  "reason.dq.unsportsmanlike": "Unsportsmanlike conduct",
  "reason.dq.other": "Other",
  "reason.dnf.equipment_failure": "Equipment failure",
  "reason.dnf.injury": "Injury",
  "reason.dnf.withdrew": "Shooter withdrew",
  "reason.dnf.other": "Other",
} as const;

export type MessageKey = keyof typeof en;

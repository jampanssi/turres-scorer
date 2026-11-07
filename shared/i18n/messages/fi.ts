import type { MessageKey } from "./en";

/**
 * Finnish. Must have exactly the keys of en.ts (a missing key is a type error).
 * TODO: have someone who knows the sport's terminology review these.
 */
export const fi: Record<MessageKey, string> = {
  "auth.title": "Kirjaudu sisään",
  "auth.email": "Sähköposti",
  "auth.emailPlaceholder": "nimi@example.fi",
  "auth.password": "Salasana",
  "auth.forgot": "Unohtuiko salasana?",
  "auth.submit": "Kirjaudu sisään",
  "auth.poweredBy": "Powered by SSI",
  "auth.error.invalidEmail": "Anna kelvollinen sähköpostiosoite.",
  "auth.error.missingPassword": "Anna salasana.",

  "theme.label": "Teema: {current}. Vaihda: {next}.",
  "theme.system": "järjestelmä",
  "theme.light": "vaalea",
  "theme.dark": "tumma",

  "language.label": "Kieli: {current}. Vaihda: {next}.",

  "stepper.max": "Enintään {max}",
  "stepper.decrease": "Vähennä: {label}",
  "stepper.increase": "Lisää: {label}",
  "stepper.count": "{label}, määrä",

  "reason.dq.unsafe_handling": "Epäturvallinen aseenkäsittely",
  "reason.dq.accidental_discharge": "Vahingossa laukaus",
  "reason.dq.unsportsmanlike": "Epäurheilijamainen käytös",
  "reason.dq.other": "Muu",
  "reason.dnf.equipment_failure": "Varustevika",
  "reason.dnf.injury": "Loukkaantuminen",
  "reason.dnf.withdrew": "Ampuja keskeytti",
  "reason.dnf.other": "Muu",
};

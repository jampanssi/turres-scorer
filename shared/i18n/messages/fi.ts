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

  "menu.label": "Käyttäjävalikko ({email})",
  "menu.signedInAs": "Kirjautunut",
  "menu.theme.toDark": "Tumma teema",
  "menu.theme.toLight": "Vaalea teema",
  "menu.signOut": "Kirjaudu ulos",

  "matches.title": "Ottelut",
  "matches.tabs": "Otteluluettelo",
  "matches.tab.open": "Avoimet",
  "matches.tab.results": "Tulokset",
  "matches.stages": "Radat",
  "matches.squads": "Ryhmät",
  "matches.shooters": "Ampujat",
  "matches.scored": "Pisteytetty",
  "matches.status.live": "Käynnissä",
  "matches.status.open": "Tulossa",
  "matches.status.finished": "Päättynyt",
  "matches.empty.open": "Ei avoimia otteluita.",
  "matches.empty.results": "Ei vielä päättyneitä otteluita.",
  "matches.loading": "Ladataan…",
  "matches.error": "Otteluiden lataus epäonnistui.",

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

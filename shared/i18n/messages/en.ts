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

  "menu.label": "User menu ({email})",
  "menu.signedInAs": "Signed in as",
  // The theme row names the mode you will switch TO (light is on -> "Dark mode").
  "menu.theme.toDark": "Dark mode",
  "menu.theme.toLight": "Light mode",
  "menu.signOut": "Sign out",

  "matches.title": "Matches",
  "matches.tabs": "Match list",
  "matches.tab.open": "Open",
  "matches.tab.results": "Results",
  "matches.stages": "Stages",
  "matches.squads": "Squads",
  "matches.shooters": "Shooters",
  "matches.scored": "Scored",
  "matches.status.live": "Live",
  "matches.status.open": "Upcoming",
  "matches.status.finished": "Finished",
  "matches.empty.open": "No open matches.",
  "matches.empty.results": "No finished matches yet.",
  "matches.loading": "Loading…",
  "matches.error": "Could not load matches.",

  "common.loading": "Loading…",
  "common.error": "Could not load the data.",

  "squads.back": "Back to matches",
  "squads.section": "Squads",
  "squads.squad": "Squad {number}",
  "squads.stageCount.one": "{count} stage",
  "squads.stageCount.other": "{count} stages",
  "squads.squadCount.one": "{count} squad",
  "squads.squadCount.other": "{count} squads",
  "squads.shooterCount.one": "{count} shooter",
  "squads.shooterCount.other": "{count} shooters",
  "squads.status.done": "Done",
  "squads.status.onRange": "On range",
  "squads.status.notStarted": "Not started",
  "squads.line.onRange": "{shooters} · Stage {stage} · {done}/{total} done",
  "squads.line.done": "{shooters} · {done}/{total} stages done",
  "squads.line.notStarted": "{shooters} · {done}/{total} done",
  "squads.progress": "Stages done",
  "squads.notFound": "Match not found.",

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

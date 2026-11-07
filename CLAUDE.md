# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

`AGENTS.md` is managed by `next dev`, which rewrites the blocks between its `BEGIN`/`END` markers. Don't edit those blocks; put Claude-specific guidance here.

## Project

**TurRes Scorer** ("Powered by SSI") is a mobile-first scoring app for applied reservist shooting matches (Turun Reserviläiset ry), scored like IPSC-style hit factor. Range Officers use it on a phone, outdoors, often with gloves and in a hurry. Flow: sign in → matches → squads → stages → shooters → scoring matrix → review → save (with DQ/DNF branches).

Read these before working on the relevant area:

- [docs/DESIGN.md](docs/DESIGN.md) and `docs/design/` (PNG per screen plus `*.dc.html` mock-ups): read before building any UI. If an image and DESIGN.md disagree, DESIGN.md wins. Rebuild the screens as React and Tailwind; don't copy the mock-up markup or its `{{…}}` template syntax.
- [docs/SCORING.md](docs/SCORING.md): the scoring rules, matrix entry behaviour and domain model. These are confirmed by the product owner; follow them exactly.
- [docs/PLAN.md](docs/PLAN.md): planned stack, structure, MVP checklist and open questions. These are plans, not facts about the code. The backend/auth is undecided, so build against a small data-access interface.

## Commands

```bash
npm run dev      # dev server at http://localhost:3000 (Turbopack)
npm run build    # production build; also the main type-check gate
npm run lint     # ESLint 9 flat config (eslint-config-next core-web-vitals + typescript)
npm run typecheck # tsc --noEmit, type-check without building
npm run format   # Prettier (code only: not docs/*.md); `format:check` only checks without changing files
```

```bash
npm test                              # Vitest, all tests
npx vitest run features/scoring       # one folder or file
npx vitest run -t "FIFO"              # tests matching a name
```

Tests use the `@/` alias.

**Node 26 is pinned** (`engines` in `package.json` and `.nvmrc`; `nvm use` or `fnm use` picks it). npm only treats a project's own `engines` as advice, so `dev`, `build` and `test` run `scripts/check-node.mjs` first and stop with a clear message on any other major version.

## No server rendering (hard requirement)

Pages are **client-rendered**: no server-rendered data, no Server Actions, no `cookies()`/`headers()`. Screens that hold state or touch data are Client Components (`'use client'`), and browser APIs (`window`, `navigator`, IndexedDB) are only used in effects or event handlers. Pages talk only to the repository interface in `shared/data/`, never to SSI or `fetch` directly.

The data source is **ShootNScoreIt (SSI)**, but it is integrated **last**. The app is built first on its own domain types (`shared/domain/`) with a mock and IndexedDB behind the repository interface. SSI later becomes an adapter in `integrations/ssi/` that maps SSI data onto those types, behind Route Handlers in `app/api/` that hold the credentials. Domain and UI code must never import from `integrations/`.

`output: 'export'` is not used, because static export can't be combined with an in-project API.

## Folder structure

Feature-based, so new features (e.g. match registration) are new folders:

- `app/`: thin route files, `globals.css` (design tokens), later `api/`. Two route groups (they do not change the URLs): `(public)` has Sign in; `(app)` holds every other screen and its `layout.tsx` is the **one session gate** (`SessionGate`). A new signed-in screen goes under `(app)` and is protected automatically.
- `features/<name>/`: components, hooks and tests per feature (`scoring`, `matches`, `squads`, `stages`, `shooters`, `auth`). `features/shell` is the frame every signed-in screen uses: `SessionGate` (sign-in guard and `useCurrentUser()`) and `Screen`.
- `shared/`: `domain/` (types), `data/` (repository, `useRepoQuery`, `mock/`, IndexedDB, sync), `ui/` (primitives), `i18n/`.
- `integrations/ssi/`: added last.

Dependencies point one way: `features/*` → `shared/*`, and `integrations/ssi` → `shared/domain`. Code used by more than one feature belongs in `shared/` (for example the scoring rules in `shared/domain/scoring.ts`). **These boundaries are enforced by ESLint** (`eslint.config.mjs`, `no-restricted-imports`): `shared` must not import `features`, `integrations` or `app`; a feature must not import another feature (the exceptions: every feature may use `features/shell`, and the shell may use `features/auth`; `auth` imports no feature). `app/error.tsx` and `app/not-found.tsx` are the global fallbacks (`shared/ui/StatusPage.tsx`); each page exports its own `metadata.title`.

## Stack notes

Next.js 16.4.5 App Router, React 19.3, strict TypeScript, Tailwind CSS v4. This Next.js is newer than most training data, so check `node_modules/next/dist/docs/` before using any Next.js API, especially caching, data fetching and routing.

Settings in [next.config.ts](next.config.ts) that change how code is written:

- `cacheComponents` and `partialPrefetching` were removed: they are server-rendering features this app doesn't use.
- **`experimental.agentFeedback: true`**: `next dev` may add feedback-reporting instructions to `AGENTS.md`. Follow them when they appear.
- **Tailwind via Turbopack loader** (`@tailwindcss/turbopack` under `turbopack.rules`): there is no PostCSS config and no `tailwind.config.*`. Theme tokens go in CSS with `@theme inline` in [app/globals.css](app/globals.css).
- The `@/*` path alias maps to the repo root. Route types (`LayoutProps<"/">`, `PageProps<...>`) are global, so don't import them.

## Conventions

- Keep scoring logic pure and framework-free (no React or UI imports), and cover it with tests. UI components only render state and dispatch actions.
- **Translations**: English is the source language and the default, Finnish is selectable (chosen in the user menu, or the language button on Sign in, which also names the language you switch to; remembered in localStorage). Never hard-code UI text. Add the key to `shared/i18n/messages/en.ts` and `fi.ts` (a missing Finnish key fails the type-check), then use `const { t } = useT(); t("key", { name })`. Plurals: add `key.one` and `key.other` and call `t("key", { count })`. A missing translation falls back to English, then to the key (with a dev console warning). Data from the data source (match, stage and shooter names) is not translated. Store enums such as DQ/DNF reasons as codes, not text, and show them via messages (`reason.dq.<code>`). Errors from logic return codes the UI translates. Some labels sit in small fixed boxes and cannot wrap (the row tile "N left"): keep those translations short, see `shared/i18n/fit.test.ts`; Finnish is usually 30-40% longer than English, so check it on the narrow screens (360 px).
- Formatting: `.` as decimal separator, HF with 4 decimals, time with 2 decimals (`8.42 s`), dates in Finnish format (`7.11`, or with year `7.11.2026`) even though the UI text is English.
- Light and dark mode are both supported, chosen in the user menu (theme and language rows name the option you switch to) (`features/auth/UserMenu`, which `Screen` puts in the header of every signed-in screen). Sign in is always light: it forces the palette with `data-theme="light"` on its root element, and has no theme control, only the language button. The theme is `<html data-theme>`, set by an inline script before first paint. Use the token utilities (`bg-surface`, `text-text`, `text-primary-text`, `text-danger-fg`), never hard-coded hex. Use `primary`/`danger` as fills (white text on them) and `primary-text`/`danger-fg` when the colour is text or a border on a surface. The dark palette is in `app/globals.css`; DESIGN.md only defines the light one.
- Accessibility: touch targets of at least 44×44 px, real `<button>`/`<a>`/`<input>`/`<label>`, `aria-label` on icon-only buttons, and colour is never the only signal.
- No long-press, swipe or other hidden gestures. Disabled controls use the `disabled` attribute and the disabled colour from DESIGN.md.
- The app is an installable **PWA**. The server is the primary store: a saved score is sent to the server right away. If the connection drops, offline is the **fallback**. Keep the score locally, show that it is unsynced, retry automatically, and let the RO keep scoring. An entered score must never be lost, and no screen may block on the network once loaded. Ranges have poor coverage. The sync approach and local storage choice are in PLAN.md.
- **Screens read data with `useRepoQuery(key, fetcher)`** (`shared/data/useRepoQuery.ts`): `key` identifies the query (for example `["squads", matchId]`) and the state returns to loading when it changes; it refetches by itself whenever the repository reports a change (`repo.subscribe`, fired after `saveScore`), keeping the old data on screen meanwhile, and only the latest request counts. Never call the repository from a render. `getRepository()` is async (the data source is loaded on demand); use it in handlers: `const repo = await getRepository(); await repo.saveScore(build(repo.now()))`. **Time comes from `repo.now()`**, not `new Date()`, so it can be the server clock later and tests can fix it. Access is guarded once by `SessionGate` (signed-out visitors go to `/`); read the signed-in user with `useCurrentUser()` (its `userId` is recorded as `roId` on saved results). **Every signed-in screen is a `Screen`** (`features/shell/Screen.tsx`): pass it the `useRepoQuery` state, the header text as a function of the data, an optional back link, and the content as a function of the loaded data. `Screen` renders the sticky header with the user menu and the loading, error and not-found messages, so a screen never repeats them (a query that returns `null` means "not found"). Save logic for the scoring screen is in `useSaveResult`.
- **The data source is chosen in one place**, `shared/data/index.ts`, by `NEXT_PUBLIC_DATA_SOURCE` (default `mock`; an `api` source is added there with SSI). The sample catalog and results live in `shared/data/mock/` and are imported only by that factory, so with another source they are not in the client bundle (checked at build time: the sample data is in the bundle by default and absent with `api`). Do not import `shared/data/mock/*` from app code, only from tests.
- The mock repository ships read-only **sample scores** for the live match (`shared/data/mock/scores.ts`, deterministic) so Done / On range states show without scoring by hand. A score saved through the repository overrides a sample with the same id. They are replaced by real data later.
- **Who counts is decided in one place: `shared/domain/progress.ts`.** Squad, stage and match progress is derived, never stored, and the summaries in `features/{matches,squads,stages,shooters}` only call `stageProgress`, `squadProgress` and `matchProgress` on a `ResultIndex` (`indexResults(results)`). A stage is done when every *expected* shooter has a saved result (scored, DNF or DQ). A DQ removes the shooter from the whole match (`disqualifiedShooterIds`): they are shown last and unselectable on Shooters, expected only on stages where they have a result (the DQ stage counts as scored, later stages do not wait for them). Never re-implement this in a screen or summary.
- A saved result is a union (`StageScore` = scored | DNF | DQ in `shared/domain/types.ts`): switch on `status`. Only a scored result has a time (always above 0), hits and penalties; a DNF or DQ has just its reason code (and a DQ an optional note). The result id is `scoreId(stageId, shooterId)` from `shared/domain/ids.ts`, the only place that knows its format. Tests build results with `shared/domain/test-fixtures.ts`.
- Browser-stored values (theme, language, session) all use `createPersistedStore` (`shared/lib/persisted-store.ts`) with their keys in `shared/lib/storage-keys.ts`: do not call `localStorage` directly.
- A shooter with a saved result opens the Scoring screen **read only** (`ScoreReadOnly`: the same `ScoreSummary` as the Review sheet, plus an Edit button); tapping Edit switches to the entry form. The Scoring screen edits a **draft** (`features/scoring/draft.ts`: pure update functions; the time is kept as the digits typed on the keypad, two implied decimals); nothing is saved until the Review sheet's "Accept & save" (`buildStageScore` in `review.ts` makes the result; the sheet also blocks saving while the time or any target is missing). Opening a saved score starts the draft from it (a saved DNF or DQ starts empty). A shooter disqualified in the match cannot be scored: the screen shows a notice instead of the form.

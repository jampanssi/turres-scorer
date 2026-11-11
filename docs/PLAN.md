# MVP plan

Planned decisions, not yet implemented. Update or delete items as they are decided or built.

## Goals

1. An RO finds their match → squad → stage → shooter in as few taps as possible.
2. Enter a stage result quickly in a **target matrix** (PractiScore-like), with no hidden gestures.
3. Errors are easy to see and fix (per-row status, per-row undo).
4. A **review step** before saving, where the shooter accepts the result.
5. **DQ** and **DNF** with explicit confirmation.

## Non-goals (for now)

- Match administration (creating matches, stages, squads, registration).
- Public results pages (the "Results" tab only lists finished matches).
- Signature capture.
- Power factor (Minor/Major) and division/gun type.

## Planned stack

The data source is **ShootNScoreIt (SSI)**, integrated **last**. Build the app first on its own domain types and a repository interface (mock + IndexedDB); SSI later maps onto those types via `integrations/ssi/` and Route Handlers in `app/api/` (BFF holding credentials, browser never calls SSI directly).

- Next.js App Router + TypeScript, client-rendered pages (no server-rendered data), no `output: 'export'`. All screens are Client Components; scoring module framework-free.
- Installable **PWA** (manifest + service worker).
- Tailwind with DESIGN.md tokens in the theme / CSS variables. No component library.
- Fonts via `next/font/google`: `Barlow_Condensed` (600, 700) and `Inter` (400–700).
- Bottom sheets (Review, DQ, DNF) over the Scoring screen: client-side sheet state or intercepting/parallel routes.
- **Server first, offline as fallback**: send each saved score to the server immediately. On failure, queue it locally (IndexedDB, e.g. Dexie), mark it as unsynced in the UI, and retry when the connection returns. Never lose an entered score. Open questions: conflict handling if the same score is edited twice, and what the UI shows for unsynced scores.
- **Vitest** for unit tests (scoring first), **Playwright** for a happy-path E2E (sign in → score → review → save).
- Logo: `public/logo.png` via `next/image`.

## Suggested structure

Feature-based, so new features (e.g. match registration) are new folders. Dependencies point one way: `features/*` → `shared/*`; `integrations/ssi` → `shared/domain`; features never import `integrations/`.

```
app/
  layout.tsx, globals.css          tokens, fonts, manifest link
  error.tsx, not-found.tsx         global fallbacks
  (public)/page.tsx                sign in
  (app)/layout.tsx                 the one session gate
  (app)/matches/page.tsx           (Open | Results)
  (app)/matches/[matchId]/...      stages, squads, shooters, score (+ sheets)
  api/                             SSI phase only
features/
  scoring/    ScoreMatrix, ScoreBar, ReviewSheet, ConfirmDQ/DNFSheet, entry.ts, draft.ts, tests
  matches/    MatchCard, SquadList, StageList, ShooterList
  shell/      SessionGate, Screen (header, user menu, loading/error/not-found)
  auth/       sign-in form, session, user menu
  (registration/ later)
shared/
  domain/     types.ts
  data/       repository.ts, index.ts (factory), useRepoQuery.ts, mock/ (catalog, scores, repository), local.ts (IndexedDB), sync.ts
  ui/         Button, Segmented, ProgressBar, BottomSheet, Stepper, AppHeader, SectionHeader, ListCard
  i18n/       messages/en.ts, messages/fi.ts, translate.ts, useT.ts, locale.ts, LanguageToggle.tsx, format.ts
integrations/
  ssi/        last: client.ts, dto.ts, mappers.ts, tests
```

## Implementation order

1. [x] Foundation: config, design tokens, fonts, format helpers (Vitest config added, package still to install)
2. [x] Domain types and scoring rules with tests (`shared/domain/types.ts`, `features/scoring/`)
3. [x] Data layer on mock + IndexedDB (`shared/data/`)
4. [x] UI primitives (`shared/ui/`)
5. [ ] Screens in design order, each one built and checked before the next (SSI-free, mock data):
   1. [x] Sign in (mock session, `features/auth/`)
   2. [x] Matches (`features/matches/`, route `/matches`)
   3. [x] Stages (`features/stages/`, route `/matches/[matchId]`; built first as squads, reordered, see ADR 0007)
   4. [x] Squads on a stage (`features/squads/`, route `/matches/[matchId]/stages/[stageId]`)
   5. [x] Shooters (`features/shooters/`, route `/matches/[matchId]/stages/[stageId]/squads/[squadId]`)
   6. [x] Scoring (matrix, steppers, sticky bar; route `.../squads/[squadId]/score/[shooterId]`). DQ, DNF and Review buttons are inert until step 7
   7. [x] Review sheet with saving (`ReviewSheet.tsx`, `review.ts`), Confirm DNF (`ConfirmDnfSheet.tsx`) and Confirm DQ (`ConfirmDqSheet.tsx`); results built in `outcome.ts`
6. [x] Installable PWA: `app/manifest.ts`, icons in `public/icons/` and `app/apple-icon.png`, iOS web-app metadata. Placeholder target icon (replace with club artwork). `public/sw.js` caches the app shell: pages already visited open without a connection
6b. [ ] Offline fallback: outbox and sync, unsynced indicator (the service worker for the app shell is done; a new page never opened before still needs a connection)
7. [ ] Playwright E2E, including an offline case
8. [ ] SSI: get API facts (docs, auth, write-back, mapping), then `integrations/ssi/`, `app/api/*`, API-backed repository

## Refactoring before offline (from the architecture review)

Behaviour-preserving, one commit per phase, all checks green after each:

- [x] Phase 0: safety net. Prettier, ESLint import boundaries, `app/error.tsx`, `app/not-found.tsx`, page titles
- [x] Phase 1: domain consolidation. Scoring rules in `shared/domain/scoring.ts`, one `shared/domain/progress.ts` for the scored/DQ rules, `StageScore` as a scored/DNF/DQ union, `createPersistedStore` for theme, language and session
- [x] Phase 2: data access. `useRepoQuery` (refetches on repository changes), async repository factory (mock data only in the bundle when configured), repository clock `now()`, session `userId`
- [x] Phase 3: screen structure. `(app)` route group with one `SessionGate`, `features/shell/Screen` for the header and loading/error/not-found, `ScoringScreen` split into `ScoringForm` and `useSaveResult`
- [x] Phase 4: base UI components. Card, form fields, IconButton, native-dialog sheet (Dialog), Popover, one ConfirmOutcomeSheet for DNF and DQ, `size-touch` and `eyebrow` tokens. Verified in real Chrome: 27 of 28 screenshots pixel-identical to before, the other differs by 1 px
- [x] Phase 5: i18n hygiene. `common.*` keys, `tEnum` (typed enum lookups, no casts), `usage.test.ts` (no unused or templated keys), width caps in `fit.test.ts`. Real-Chrome Finnish audit at 360 and 390 px: stage detail lines now wrap instead of being cut off
- [ ] Phase 6: component tests (Testing Library) and `fake-indexeddb`. Skipped for now; the real-browser dialog checks may become Playwright tests
- [x] Phase 7: docs and ADRs (`docs/adr/`, five short records)

## UX review (done)

From a UX pass over every screen; details in DESIGN.md (Toast, Load errors, Sticky bottom bar, Scoring, Time keypad).

- [x] Save confirmation toast (HeroUI-style, no shortcut button), saved row highlighted, `router.replace` to the shooter list after save
- [x] Try again on load errors; unsaved-changes prompt, Cancel edit
- [x] Clear key on the time keypad; matrix press feedback (DQ and DNF stay in the score bar)
- [x] Sign in: no inert link, "Signing in…"; empty states on Squads, Stages, Shooters
- [ ] Not done: reserved slot for an unsynced mark (do it with the offline step), dark palette contrast pass, Finnish copy review

## DNS (done)

- [x] Domain (`attendance.ts`, DNS in `progress.ts`), attendance stores (IndexedDB v2), repository methods, mock seed (one DNS shooter)
- [x] Shooters tab on the match view with all squads grouped (always open) and a more button per shooter (Change squad, DNS) (first built as a roll call with Here/DNS, a gate and counters; simplified after testing), DNS row on the stage's shooter list, Scoring notice
- [ ] Not done: the time zone is fixed to Europe/Helsinki; SSI may have its own check-in; a DNS from an earlier day carries over until taken back

## Navigation order (done)

- [x] match → stages → squads → shooters → scoring (the RO stays at a stage and squads rotate); `stageProgressAcross` for the stage cards, `squadProgress` removed
- [ ] Not done: no redirects from the old URLs (no users yet); squads are listed by number, not by rotation; the UI no longer uses `Squad.stageRotation`

## Complete match (done)

- [x] `repo.completeMatch`, completion store (IndexedDB v3), repository guards, the Complete match sheet with the results-visibility radio group (button disabled until every stage is done), status block, read-only scoring and DNS
- [ ] Not done: a results view that honours the visibility, Reopen, a match-director restriction (no roles yet), completing an upcoming match; the future API needs `POST /matches/:id/complete`

## Definition of done (MVP)

- [ ] All screens in DESIGN.md at 390×844, usable down to 360 px wide.
- [ ] Scoring rules and limits exactly as in SCORING.md, with unit tests for every example.
- [ ] Matrix entry: FIFO replace, per-row undo, row completeness tile with `N left`.
- [ ] Review sheet shows time, points, HF, hit totals, per-target hits, shooter acceptance checkbox; Accept & save disabled until ticked.
- [ ] DQ/DNF confirmation sheets with reason select; confirming records status and returns to Shooters.
- [ ] Scores persist offline and survive reload.

## Open questions

- SSI: API access and docs, auth method, whether scores can be written back, and how SSI divisions, power factor and stage config map to this sport.
- If a pure static export is ever required, the API must become a separate service.
- PWA service worker: hand-written (`public/sw.js`), no library. Open: whether to precache more than visited pages, and how to handle updates while a shift is in progress (today a new version applies on the next page load).

- Backend / auth provider and how ROs are provisioned.
- Who can reverse a DQ and how (current copy says "needs the Range Master's approval"). DQ rows are not selectable in the app, so a reversal would need its own flow.
- Final DQ / DNF reason lists.
- Review the Finnish translations (`shared/i18n/messages/fi.ts`) with someone who knows the sport's terms. Should Finnish also use `,` as the decimal separator for HF and time?

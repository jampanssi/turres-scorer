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
  page.tsx                         sign in
  matches/page.tsx                 (Open | Results)
  matches/[matchId]/...            squads, stages, shooters, score (+ sheets)
  api/                             SSI phase only
features/
  scoring/    ScoreMatrix, MatrixRow, ScoreBar, ReviewSheet, ConfirmDQ/DNFSheet, rules.ts, entry.ts, tests
  matches/    MatchCard, SquadList, StageList, ShooterList
  auth/       sign-in form, session hook
  (registration/ later)
shared/
  domain/     types.ts
  data/       repository.ts, mock.ts, local.ts (IndexedDB), sync.ts
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
   3. [x] Squads (`features/squads/`, route `/matches/[matchId]`)
   4. [x] Stage selection (`features/stages/`, route `/matches/[matchId]/squads/[squadId]`)
   5. [x] Shooters (`features/shooters/`, route `/matches/[matchId]/squads/[squadId]/stages/[stageId]`)
   6. [ ] Scoring (matrix, steppers, sticky bar)
   7. [ ] Confirm DQ, Confirm DNF and Review sheets, with saving
6. [ ] Offline fallback and PWA
7. [ ] Playwright E2E, including an offline case
8. [ ] SSI: get API facts (docs, auth, write-back, mapping), then `integrations/ssi/`, `app/api/*`, API-backed repository

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
- PWA service worker: Next.js has no built-in one, so it's hand-written or a library. It must cache the app shell for offline use.

- Backend / auth provider and how ROs are provisioned.
- Who can reverse a DQ and how (current copy says "needs the Range Master's approval"). DQ rows are not selectable in the app, so a reversal would need its own flow.
- Final DQ / DNF reason lists.
- Review the Finnish translations (`shared/i18n/messages/fi.ts`) with someone who knows the sport's terms. Should Finnish also use `,` as the decimal separator for HF and time?

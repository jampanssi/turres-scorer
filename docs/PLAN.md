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

Backend/API is **undecided**: build against a small data-access interface so it can be swapped.

- Next.js App Router + TypeScript as a **client-only static export** (`output: 'export'`): no server rendering in any phase. All screens are Client Components; scoring module framework-free.
- Installable **PWA** (manifest + service worker).
- Tailwind with DESIGN.md tokens in the theme / CSS variables. No component library.
- Fonts via `next/font/google`: `Barlow_Condensed` (600, 700) and `Inter` (400–700).
- Bottom sheets (Review, DQ, DNF) over the Scoring screen: client-side sheet state or intercepting/parallel routes.
- **Server first, offline as fallback**: send each saved score to the server immediately. On failure, queue it locally (IndexedDB, e.g. Dexie), mark it as unsynced in the UI, and retry when the connection returns. Never lose an entered score. Open questions: conflict handling if the same score is edited twice, and what the UI shows for unsynced scores.
- **Vitest** for unit tests (scoring first), **Playwright** for a happy-path E2E (sign in → score → review → save).
- Logo: `public/logo.png` via `next/image`.

## Suggested structure

Caveat: the nested dynamic routes below don't work in a static export without `generateStaticParams()`, because IDs aren't known at build time. Pick one: query params on a few static routes (e.g. `/squad?match=…&squad=…`), or one client-side shell that does its own routing. Decide before building screens.

```
app/
  sign-in/page.tsx
  matches/page.tsx                                            (Open | Results)
  matches/[matchId]/page.tsx                                  squads
  matches/[matchId]/squads/[squadId]/page.tsx                 stage selection
  matches/[matchId]/squads/[squadId]/stages/[stageId]/page.tsx              shooters
  matches/[matchId]/squads/[squadId]/stages/[stageId]/score/[shooterId]/page.tsx  scoring + sheets
components/   AppHeader, SectionHeader, ListCard, ProgressBar, Button, Segmented, BottomSheet,
              ScoreMatrix, MatrixRow, MatrixCell, RowLabelTile, UndoButton, Stepper,
              ReviewSheet, ConfirmDQSheet, ConfirmDNFSheet
lib/
  scoring/    rules.ts (points, HF, limits), entry.ts (FIFO add, undo), *.test.ts
  data/       repository interface, local (IndexedDB) impl, sync
  i18n/en.ts
```

## Definition of done (MVP)

- [ ] All screens in DESIGN.md at 390×844, usable down to 360 px wide.
- [ ] Scoring rules and limits exactly as in SCORING.md, with unit tests for every example.
- [ ] Matrix entry: FIFO replace, per-row undo, row completeness tile with `N left`.
- [ ] Review sheet shows time, points, HF, hit totals, per-target hits, shooter acceptance checkbox; Accept & save disabled until ticked.
- [ ] DQ/DNF confirmation sheets with reason select; confirming records status and returns to Shooters.
- [ ] Scores persist offline and survive reload.

## Open questions

- Remove `cacheComponents` and `partialPrefetching` from `next.config.ts` and add `output: 'export'`?
- Does "no server rendering" also rule out build-time prerendering of the static HTML shell, or only runtime SSR?
- How are IDs carried between screens (see Suggested structure)?
- PWA service worker: Next.js has no built-in one, so it's hand-written or a library. It must cache the app shell for offline use.

- Backend / auth provider and how ROs are provisioned.
- Who can reverse a DQ and how (current copy says "needs the Range Master's approval").
- Final DQ / DNF reason lists.
- Whether a Finnish UI is needed at launch.

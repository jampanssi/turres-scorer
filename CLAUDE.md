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
npx tsc --noEmit # type-check without building
```

No test runner is set up yet (Vitest is planned, see PLAN.md).

## No server rendering (hard requirement)

The app is **client-only** at every stage: no server rendering at runtime, no Server Actions, no cookies/headers/proxy, no route handlers that read the request, no server-side data fetching. It is meant to be built as a static export (`output: 'export'`; see `01-app/02-guides/static-exports.md` and `single-page-applications.md` in the bundled docs). All data goes through the client-side data-access layer to the external server, and the same layer provides the offline fallback.

- Screens that hold state or touch data are Client Components (`'use client'`). Browser APIs (`window`, `navigator`, IndexedDB) are only used inside effects or event handlers.
- IDs (match, squad, stage, shooter) are not known at build time, so dynamic path segments don't work without `generateStaticParams()`. How IDs are passed between screens is not decided yet, see PLAN.md.
- Static export prerenders Client Components to HTML at build time. Don't write code that depends on that.

## Stack notes

Next.js 16.4.5 App Router, React 19.3, strict TypeScript, Tailwind CSS v4. This Next.js is newer than most training data, so check `node_modules/next/dist/docs/` before using any Next.js API, especially caching, data fetching and routing.

Settings in [next.config.ts](next.config.ts) that change how code is written:

- **`cacheComponents: true`** and **`partialPrefetching: true`** came from the scaffold and are server-rendering features. They probably don't fit a client-only static export and are up for review (see PLAN.md). Don't build on them.
- **`experimental.agentFeedback: true`**: `next dev` may add feedback-reporting instructions to `AGENTS.md`. Follow them when they appear.
- **Tailwind via Turbopack loader** (`@tailwindcss/turbopack` under `turbopack.rules`): there is no PostCSS config and no `tailwind.config.*`. Theme tokens go in CSS with `@theme inline` in [app/globals.css](app/globals.css).
- The `@/*` path alias maps to the repo root. Route types (`LayoutProps<"/">`, `PageProps<...>`) are global, so don't import them.

## Conventions

- Keep scoring logic pure and framework-free (no React or UI imports), and cover it with tests. UI components only render state and dispatch actions.
- UI language is English. Keep all strings in one place (e.g. `lib/i18n/en.ts`) so a Finnish locale can be added later.
- Formatting: `.` as decimal separator, HF with 4 decimals, time with 2 decimals (`8.42 s`), dates like `Sat 7 Nov`.
- Accessibility: touch targets of at least 44×44 px, real `<button>`/`<a>`/`<input>`/`<label>`, `aria-label` on icon-only buttons, and colour is never the only signal.
- No long-press, swipe or other hidden gestures. Disabled controls use the `disabled` attribute and the disabled colour from DESIGN.md.
- The app is an installable **PWA**. The server is the primary store: a saved score is sent to the server right away. If the connection drops, offline is the **fallback**. Keep the score locally, show that it is unsynced, retry automatically, and let the RO keep scoring. An entered score must never be lost, and no screen may block on the network once loaded. Ranges have poor coverage. The sync approach and local storage choice are in PLAN.md.

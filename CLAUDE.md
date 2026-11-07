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

```bash
npm test                              # Vitest, all tests (needs `npm i -D vitest`, see below)
npx vitest run features/scoring       # one folder or file
npx vitest run -t "FIFO"              # tests matching a name
```

The `test` script and `vitest.config.ts` exist, but the `vitest` package may still need installing: run `npm i -D vitest` if `npm test` can't find it. Tests use the `@/` alias.

## No server rendering (hard requirement)

Pages are **client-rendered**: no server-rendered data, no Server Actions, no `cookies()`/`headers()`. Screens that hold state or touch data are Client Components (`'use client'`), and browser APIs (`window`, `navigator`, IndexedDB) are only used in effects or event handlers. Pages talk only to the repository interface in `shared/data/`, never to SSI or `fetch` directly.

The data source is **ShootNScoreIt (SSI)**, but it is integrated **last**. The app is built first on its own domain types (`shared/domain/`) with a mock and IndexedDB behind the repository interface. SSI later becomes an adapter in `integrations/ssi/` that maps SSI data onto those types, behind Route Handlers in `app/api/` that hold the credentials. Domain and UI code must never import from `integrations/`.

`output: 'export'` is not used, because static export can't be combined with an in-project API.

## Folder structure

Feature-based, so new features (e.g. match registration) are new folders:

- `app/`: thin route files, `globals.css` (design tokens), later `api/`.
- `features/<name>/`: components, hooks and tests per feature (`scoring`, `matches`, `auth`).
- `shared/`: `domain/` (types), `data/` (repository, mock, IndexedDB, sync), `ui/` (primitives), `i18n/`.
- `integrations/ssi/`: added last.

Dependencies point one way: `features/*` → `shared/*`, and `integrations/ssi` → `shared/domain`.

## Stack notes

Next.js 16.4.5 App Router, React 19.3, strict TypeScript, Tailwind CSS v4. This Next.js is newer than most training data, so check `node_modules/next/dist/docs/` before using any Next.js API, especially caching, data fetching and routing.

Settings in [next.config.ts](next.config.ts) that change how code is written:

- `cacheComponents` and `partialPrefetching` were removed: they are server-rendering features this app doesn't use.
- **`experimental.agentFeedback: true`**: `next dev` may add feedback-reporting instructions to `AGENTS.md`. Follow them when they appear.
- **Tailwind via Turbopack loader** (`@tailwindcss/turbopack` under `turbopack.rules`): there is no PostCSS config and no `tailwind.config.*`. Theme tokens go in CSS with `@theme inline` in [app/globals.css](app/globals.css).
- The `@/*` path alias maps to the repo root. Route types (`LayoutProps<"/">`, `PageProps<...>`) are global, so don't import them.

## Conventions

- Keep scoring logic pure and framework-free (no React or UI imports), and cover it with tests. UI components only render state and dispatch actions.
- **Translations**: English is the source language and the default, Finnish is selectable (EN/FI toggle top right, remembered in localStorage). Never hard-code UI text. Add the key to `shared/i18n/messages/en.ts` and `fi.ts` (a missing Finnish key fails the type-check), then use `const { t } = useT(); t("key", { name })`. Plurals: add `key.one` and `key.other` and call `t("key", { count })`. A missing translation falls back to English, then to the key (with a dev console warning). Data from the data source (match, stage and shooter names) is not translated. Store enums such as DQ/DNF reasons as codes, not text, and show them via messages (`reason.dq.<code>`). Errors from logic return codes the UI translates.
- Formatting: `.` as decimal separator, HF with 4 decimals, time with 2 decimals (`8.42 s`), dates in Finnish format (`7.11`, or with year `7.11.2026`) even though the UI text is English.
- Light and dark mode are both supported, with a toggle (system → light → dark) top right in `AppHeader` and on Sign in (`shared/theme/`). The theme is `<html data-theme>`, set by an inline script before first paint. Use the token utilities (`bg-surface`, `text-text`, `text-primary-text`, `text-danger-fg`), never hard-coded hex. Use `primary`/`danger` as fills (white text on them) and `primary-text`/`danger-fg` when the colour is text or a border on a surface. The dark palette is in `app/globals.css`; DESIGN.md only defines the light one.
- Accessibility: touch targets of at least 44×44 px, real `<button>`/`<a>`/`<input>`/`<label>`, `aria-label` on icon-only buttons, and colour is never the only signal.
- No long-press, swipe or other hidden gestures. Disabled controls use the `disabled` attribute and the disabled colour from DESIGN.md.
- The app is an installable **PWA**. The server is the primary store: a saved score is sent to the server right away. If the connection drops, offline is the **fallback**. Keep the score locally, show that it is unsynced, retry automatically, and let the RO keep scoring. An entered score must never be lost, and no screen may block on the network once loaded. Ranges have poor coverage. The sync approach and local storage choice are in PLAN.md.

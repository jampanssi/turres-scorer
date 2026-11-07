# 0008: Completing a match is final and stores who may see the results

**Status:** accepted (confirmed by the product owner)

**Context.** A match had a status but no way to finish it in the app. Range officers need to close a match, and the organiser wants to decide who sees the results.

**Decision.** Any range officer can complete a live match from the bottom of the Stages view, through a confirmation sheet that offers a **results visibility** choice (Everyone, Participants only, Organisers only; default Participants only). The button is **disabled until every stage is done** (`canCompleteMatch` in `shared/domain/match-state.ts`), so a match cannot be closed with results missing. Completing is **final in the app** (no Reopen) and makes the match read only. The choice, the time (repository clock) and the officer are stored on the match. The rule is enforced in the repository, not only in the screens: `saveScore` and `saveAttendance` throw `RepositoryError("matchCompleted")` for a completed match, so a stale screen or the future API cannot change one.

**Consequences.** The visibility is stored but nothing in the UI hides data yet: the app has no results view, so a results view and the export must honour it. A mistaken completion needs the organiser outside the app, and the sheet says so. The "every stage done" rule is a screen rule only: the repository does not check it, so the future API should. There are no roles yet, so "match director only" belongs to the auth phase. IndexedDB moves to version 3 (a `matches` store; the upgrade only creates what is missing). The API needs `POST /matches/:id/complete` with the same rules.

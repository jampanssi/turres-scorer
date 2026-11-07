# 0002: A repository seam, SSI integrated last

**Status:** accepted

**Context.** The data source is ShootNScoreIt (SSI), but its API, auth and write-back are not yet known, and the backend is undecided.

**Decision.** The app is built on its own domain types (`shared/domain/`) behind a repository interface (`shared/data/repository.ts`). The source is chosen in one place, `shared/data/index.ts`, by `NEXT_PUBLIC_DATA_SOURCE` (default `mock`). SSI becomes an adapter in `integrations/ssi/` behind Route Handlers in `app/api/` that hold the credentials. Domain and UI code never import `integrations/`; ESLint enforces the import directions.

**Consequences.** Mock data lives in `shared/data/mock/` and is left out of the client bundle for other sources. Time comes from `repo.now()`. SSI mapping questions (divisions, power factor, stage config) are resolved inside the adapter, not in screens.

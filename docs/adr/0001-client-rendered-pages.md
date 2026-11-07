# 0001: Pages are client-rendered

**Status:** accepted

**Context.** Range Officers use the app outdoors with poor coverage. Once loaded, no screen may depend on a server render or the network.

**Decision.** Every screen is a Client Component. No server-rendered data, no Server Actions, no `cookies()` or `headers()`. Browser APIs are used only in effects and handlers. `output: 'export'` is not used, because it cannot be combined with an API in the same project.

**Consequences.** Data comes through `useRepoQuery` and the repository interface only. The Next.js server is needed just for static assets and, later, `app/api/` route handlers. If a pure static export is ever required, the API must become a separate service.

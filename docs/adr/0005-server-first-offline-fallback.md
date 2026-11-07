# 0005: Server first, offline as the fallback

**Status:** accepted (design); implementation pending

**Context.** The server is the primary store, but ranges have poor coverage and an entered score must never be lost.

**Decision.** A saved score is sent to the server right away. If the connection drops, it is kept locally (IndexedDB), shown as unsynced, retried automatically, and the RO keeps scoring. No screen blocks on the network once loaded. The app is an installable PWA that caches its shell.

**Consequences.** The local score store becomes an outbox with a sync state and a version for conflict detection. Open questions: conflict handling if the same score is edited twice, and the exact unsynced indicator. See `docs/PLAN.md`.

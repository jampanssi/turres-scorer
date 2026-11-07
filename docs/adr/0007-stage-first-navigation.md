# 0007: Navigation goes match → stages → squads → shooters

**Status:** accepted (confirmed by the product owner)

**Context.** The app first went match → squads → stages → shooters. On the range it is the other way round: a Range Officer stands at one stage and the squads rotate through it, so the officer picks a stage once and then meets one squad after another.

**Decision.** The match view lists the **stages** (with their progress over every squad), a stage lists its **squads** by squad number (each with its progress on that stage), and a squad lists its shooters, then scoring: `/matches/[matchId]/stages/[stageId]/squads/[squadId]/score/[shooterId]`. The match view's second tab, Shooters (DNS), is unchanged. Progress is still derived in one place, `shared/domain/progress.ts`: `stageProgress` for one squad on one stage (the squad cards), the new `stageProgressAcross` for a stage over all squads (the stage cards). `squadProgress` (a squad over all its stages) has no screen any more and was removed. There is no "RO of a stage" concept: the signed-in user is recorded as `roId` on each result.

**Consequences.** The old URLs no longer exist (the app has no users yet, so there are no redirects). `Squad.stageRotation` stays in the domain type because SSI may supply it, but no screen uses it; only the mock data's sample scores do. A stage with many squads is a long list and has no filter. The mock-up images for the old screens 3 and 4 are stale; DESIGN.md describes the new screens.

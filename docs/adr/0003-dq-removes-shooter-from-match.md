# 0003: A DQ removes the shooter from the whole match

**Status:** accepted (confirmed by the product owner)

**Context.** After a disqualification the shooter must not be scored again, yet stage and squad progress must still reach "done".

**Decision.** A DQ result disqualifies the shooter for the match. They are listed last and cannot be selected on Shooters. They are expected only on stages where they have a result: the DQ stage counts as scored, later stages do not wait for them. This is decided in one place, `shared/domain/progress.ts`; summaries only call `stageProgress`, `squadProgress` and `matchProgress`.

**Consequences.** Progress is derived, never stored. There is no flow to reverse a DQ yet (the copy says it needs the Range Master's approval); it would need its own flow.

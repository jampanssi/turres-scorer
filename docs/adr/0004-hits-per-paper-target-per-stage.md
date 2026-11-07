# 0004: Hits per paper target is set per stage

**Status:** accepted (confirmed by the product owner)

**Context.** Paper targets are usually scored with 2 hits, but some stages use 1 or 3.

**Decision.** `Stage.hitsPerPaperTarget` is 1, 2 or 3 and comes from the stage data. All scoring rules, the matrix, the maximum procedurals and the minimum rounds use it instead of a constant 2. See `docs/SCORING.md`.

**Consequences.** Tests cover all three values. `Stage.minRounds` is stored but derivable (paper × hits + steel); which is the source of truth is decided when SSI data arrives.

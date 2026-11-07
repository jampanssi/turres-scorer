# Scoring rules and domain model

Source of truth for scoring. All rules were confirmed by the product owner. Implement them in a pure, unit-tested module with no UI dependencies (`lib/scoring/`), with a test for every example below.

## User flow

```
Sign in → Matches (Open | Results) → Squads in match → Stage selection
        → Shooters on stage (shooting order) → Scoring (matrix)
              ├─ DQ  → Confirm DQ (bottom sheet)  → back to Shooters
              ├─ DNF → Confirm DNF (bottom sheet) → back to Shooters
              └─ Review → Review score (bottom sheet) → Accept & save → back to Shooters
                                                  └─ Edit → back to Scoring
```

Several squads can be on the range at the same time, each on a different stage.

## Hit values

| Code | Meaning | Points |
|---|---|---|
| A | Alpha zone hit | +5 |
| C | Charlie zone hit | +3 |
| D | Delta zone hit | +1 |
| M | Miss | −10 |
| NS | No-shoot hit | −10 each |
| PE | Procedural error | −10 each |

- **Stage points** = `max(0, 5·A + 3·C + 1·D − 10·(M + NS + PE))`. Never negative.
- **Hit factor (HF)** = `points / time` (seconds). Display with **4 decimals** (e.g. `6.4133`). If time ≤ 0 or empty, HF = 0.
- Time is entered on a number pad (digits 0-9 and backspace). The last two digits are the decimals, so typing 8, 4, 2 gives 8.42 s; at most 5 digits (999.99 s). Display uses `.` (English UI).

## Targets

- **Paper target**: exactly **H** scored entries, each one of `A | C | D | M`. **H is set per stage** (`hitsPerPaperTarget`): 1, 2 or 3, usually 2. Everything below uses H.
- **Steel target**: exactly **1** entry, either `A` or `M` (mutually exclusive).
- A stage has N paper targets, S steel targets and K no-shoot targets (configured per stage).

## Penalty limits

- **No-shoot max** = `K × 2`. Example: 2 no-shoot targets → max 4.
- **Procedural max** = `ceil(maxPoints / 10)` where `maxPoints = N × H × 5 + S × 5` (N paper targets, S steel targets).
  Example (H = 2): 6 paper + 3 steel → maxPoints 75 → PE max = ceil(7.5) = **8**. (8 procedurals guarantee a zero stage.) With H = 1, 4 paper + 2 steel → 30 → **3**; with H = 3, 6 paper + 2 steel → 100 → **10**.
- The `+` control is disabled when the max is reached.

## Matrix entry behaviour

- Tapping a paper cell **adds** a hit of that type to the row. Cells never cycle back to zero.
- A paper row keeps the **H most recent taps** (FIFO): with H entries already, a new tap drops the **oldest**. Examples for H = 2, 1 and 3:
  - `AA` + tap `C` → `AC`
  - `AA` + tap `C`, tap `M` → `CM`
  - `AA` + tap `C`, tap `C` → `CC`
  - H = 1: each tap replaces the previous one (`A` + tap `C` → `C`)
  - H = 3: `AAA` + tap `C` → `AAC`; `AAA` + tap `C`, tap `M` → `ACM`
- Each row has a visible **Undo** button removing that row's most recent entry (steel: clears the row). Disabled when empty.
- Tapping a steel cell sets it to that value (A or M); the other is cleared.
- A row is **complete** when it has its required count. The row-number tile is green when complete; otherwise red-tinted with `N left` (e.g. `1 left`).
- No long-press, swipe or other hidden gestures.

## Domain model (suggested)

```ts
type HitCode = 'A' | 'C' | 'D' | 'M';

interface Match   { id: string; name: string; date: string; range: string; status: 'open' | 'live' | 'finished';
                    stageIds: string[]; squadIds: string[]; }
interface Stage   { id: string; matchId: string; number: number; name: string;
                    minRounds: number; paperTargets: number; hitsPerPaperTarget: 1 | 2 | 3;
                    steelTargets: number; noShootTargets: number; }
interface Squad   { id: string; matchId: string; number: number; shooterIds: string[];   // ordered = shooting order
                    stageRotation: string[]; }
interface Shooter { id: string; name: string; competitorNumber: number; }

// One saved result of one shooter on one stage. Switch on `status`.
interface ResultBase { id: string; matchId: string; stageId: string; shooterId: string; roId: string;
                       note?: string; createdAt: string; updatedAt: string; }

interface ScoredStageScore extends ResultBase {
  status: 'scored';
  timeSec: number;             // always above 0: a result cannot be saved without a time
  paper: HitCode[][];          // one array per paper target, at most hitsPerPaperTarget hits, order = tap order
  steel: ('A' | 'M' | null)[]; // one per steel target
  noShoots: number;
  procedurals: number;
  shooterAccepted: boolean;
}
interface DnfStageScore extends ResultBase { status: 'dnf'; dnfReason: DnfReason }  // no time, no hits
interface DqStageScore  extends ResultBase { status: 'dq';  dqReason: DqReason }   // no time, no hits

type StageScore = ScoredStageScore | DnfStageScore | DqStageScore;
```

Derived, never stored as source of truth: points, HF, totals per code, row completeness, stage/squad progress ("2 / 6 stages done", "3 / 8 scored").

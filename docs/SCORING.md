# Scoring rules and domain model

Source of truth for scoring. All rules were confirmed by the product owner. Implement them in a pure, unit-tested module with no UI dependencies (`lib/scoring/`), with a test for every example below.

## User flow

```
Sign in → Matches (Open | Results) → Stages in match (second tab: Shooters, to mark DNS)
        → Squads on the stage → Shooters of the squad (shooting order) → Scoring (matrix)
              ├─ DQ  → Confirm DQ (bottom sheet)  → back to Shooters
              ├─ DNF → Confirm DNF (bottom sheet) → back to Shooters
              └─ Review → Review score (bottom sheet) → Accept & save → back to Shooters
                                                  └─ Edit → back to Scoring
```

The order follows the range: a range officer stands at one stage and the squads rotate through it. Several squads can be in progress at the same time, each on a different stage.

## Completing a match

Any range officer can complete a live match from the bottom of the Stages view, but only **once every stage is done** (every expected shooter of every squad has a result, so a DNS or disqualified shooter does not hold it up); until then the button is disabled with a hint. The confirmation sheet asks **who can see the results** (Everyone, Participants only, Organisers only; default Participants only). Completing is **final in the app**: the match is "finished", listed under Results, and read only. Scoring, DNS marks and every other change are refused by the repository. The visibility, the time and the officer are stored on the match; a results view and the export must honour the visibility. An upcoming match cannot be completed.

## Change squad

By tapping a shooter on the match's Shooters tab, an RO can move the shooter to another squad of the same match. The move is for the **whole match** (not only the current stage): the shooter leaves the old squad and joins the **end** of the chosen squad's shooting order. Results already saved stay with the shooter. **Only a shooter with no saved result on any stage can be moved** (once they have shot a stage, scored, DNF or DQ, their squad is fixed). A completed match cannot be changed. The same menu marks or unmarks DNS; a shooter with a result cannot be marked DNS (an existing mark can still be taken back).

## DNS (did not show)

Everyone is present by default. The **Shooters** tab of the match view lists every squad with its shooters, and a range officer marks the ones who did not show as **DNS** (only a status: no reason, no note). Any range officer can take a DNS back.

- A mark stays until someone changes it, on the same day or a later one: the shooter's **latest** record decides. Records carry the calendar day they were made (Europe/Helsinki, from the repository clock).
- A DNS shooter is **not expected** on a stage, except on a stage where they already have a result (same pattern as a DQ). They are listed last on Shooters, not selectable, and they do not hold up stage, squad or match progress. Taking the mark back makes them expected again.
- There is no gate: a squad can always open its stages and be scored.
- A shooter disqualified from the match cannot be marked.

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
- **Steel target**: exactly **1** entry, either `A` or `M` (mutually exclusive). **A steel target starts as `A` when the Scoring screen opens**, so a steel row is never empty and the range officer only taps the misses (`M`). The shooter must still review the score before it is saved.
- A stage has N paper targets, S steel targets and K no-shoot targets (configured per stage).

## Penalty limits

- **No-shoot max** = `K × 2`. Example: 2 no-shoot targets → max 4.
- **Procedural max** = `ceil(maxPoints / 10)` where `maxPoints = N × H × 5 + S × 5` (N paper targets, S steel targets).
  Example (H = 2): 6 paper + 3 steel → maxPoints 75 → PE max = ceil(7.5) = **8**. (8 procedurals guarantee a zero stage.) With H = 1, 4 paper + 2 steel → 30 → **3**; with H = 3, 6 paper + 2 steel → 100 → **10**.
- The `+` control is disabled when the max is reached.

## Matrix entry behaviour

- Tapping a paper cell **adds** a hit of that type to the row. Cells never cycle back to zero.
- A paper row holds **H** hits. While it has room, a tap adds a hit. On a **full** row a tap **replaces a hit that differs**: the **oldest entry that is not the tapped code** is dropped and the tapped code is added. The order of a row never matters for the score, only which codes it holds. Examples for H = 2, 1 and 3:
  - `AA` + tap `C` → `AC`
  - `AA` + tap `C`, tap `M` → `CM`
  - `AA` + tap `C`, tap `C` → `CC`
  - **Fixing a hit takes one tap**: `AC` + tap `A` → `AA`; `AM` + tap `A` → `AA`; `AC` + tap `C` → `CC` (a plain "drop the oldest" would turn `AC` + `A` into `CA`, the same hits, and the fix would need a second tap)
  - Tapping a code the whole row already holds changes nothing: `AA` + tap `A` → `AA`
  - H = 1: each tap replaces the previous one (`A` + tap `C` → `C`)
  - H = 3: `AAA` + tap `C` → `AAC`; `AAA` + tap `C`, tap `M` → `ACM`; `ACD` + tap `A` → `AAD` (the oldest hit that is not an `A` is replaced)
- Each row has a visible **Undo** button removing that row's most recent entry (steel: puts the row back to the default `A`). Disabled when there is nothing to undo (an empty paper row, a steel row that is already `A`).
- Tapping a steel cell sets it to that value (A or M); the other is cleared.
- The order of a row never matters for the score, so Review and the read-only summary always show a row's hits **alphabetically** (`AC`, `AM`), even if they were tapped as `CA` or `MA`.
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

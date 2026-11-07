# DESIGN.md — TurRes Scorer

Visual design and screen specification. Behaviour and scoring rules are in **[SCORING.md](./SCORING.md)**.
Reference material for every screen is in `docs/design/`:
- **Images** (PNG/PDF exports of each screen) — the primary visual reference: match layout, hierarchy and look against these.
- **`*.dc.html` sources** — use for exact values (hex colours, px sizes, radii, copy) when the image is ambiguous. File names: `Main` = Sign in, `Events` = Matches, `Squads`, `Stages`, `Shooters`, `Scoring`, `Review`, `ConfirmDQ`, `ConfirmDNF`.

If an image and this document disagree, this document wins (it reflects the latest decisions).
Reference device: **390 × 844 px** (phone, portrait). Everything must also work at 360 px wide.

---

## 1. Design principles

- **Built for the range**: big targets (≥ 44 px), high contrast, one primary action per screen.
- **Mostly blue**: the club blue `#005185` carries primary actions and active states; Sign in is the only full-blue screen. Headers have **no coloured bar**: they sit on the page background. Green = done/complete, red = misses, penalties, DQ.
- **Nothing hidden**: every action is a visible button. No long-press or swipe.
- **Status is always visible**: progress counts sit in section headers; incomplete rows say what is missing.

---

## 2. Colour tokens

| Token | Hex | Use |
|---|---|---|
| `primary` | `#005185` | Primary buttons, selected segments, the user avatar, filled A/C/D cells, `+` buttons, progress fill, links |
| `primary-dark` | `#00406A` | Not used by headers any more (kept for dark panels on blue) |
| `primary-hover` | `#003A60` | Link hover / pressed |
| `primary-tint` | `#E6F0F8` | Active row background (e.g. shooter currently shooting) |
| `primary-tint-2` | `#E0EDF6` | Light blue badges |
| `on-primary-muted` | `#C9D6E5` | Secondary text on blue (Sign in) |
| `on-primary-accent` | `#9CCBEA` | Highlight numbers on blue (HF on blue cards) |
| `bg` | `#EEF2F6` | App background |
| `surface` | `#FFFFFF` | Cards, sheets, inputs |
| `surface-muted` | `#F3F6F9` | Empty matrix cells, stat tiles, placeholders |
| `surface-tile` | `#E6ECF2` | "Not started" number tiles |
| `border` | `#C5CFDA` | Inputs, outline buttons, undo buttons, sheet handle |
| `border-light` | `#D5DDE6` | Empty matrix cell border, bottom bar top border |
| `divider` | `#E1E7EE` | Dividers, progress track |
| `text` | `#10202F` | Primary text |
| `text-secondary` | `#4A5B6C` | Secondary text, captions |
| `text-label` | `#3B4B5C` | Form labels, section labels |
| `disabled` | `#A9B6C3` | Disabled icons / disabled `+` button background |
| `chevron` | `#7A8A9A` | List chevrons |
| `success` | `#237A34` | Completed row tile (white text) |
| `success-text` | `#2F4A22` | "Done" status text, HF chip text |
| `success-tint` | `#E3EEDC` | Done tiles / live badge background |
| `danger` | `#B42318` | M cells, DQ button, M/NS column headers |
| `danger-tint` | `#FBE4E2` | Incomplete row tile, DQ warning box, miss highlight |
| `danger-text` | `#8A1C12` | Text on `danger-tint` |
| `scrim` | `rgba(16,32,47,0.55)` | Overlay behind bottom sheets |

Contrast: all text pairs above meet WCAG AA (4.5:1) at the sizes used.

**Dark mode** (the tables above are the light palette). The choice is made with the theme row in the user menu on signed-in screens (light or dark); it is remembered. **Sign in is always light** (it ignores the saved theme and has no theme control). "System" follows `prefers-color-scheme`. The full dark palette lives in `app/globals.css`. Rules: `primary` and `danger` stay as fill colours with white text; two extra tokens cover text or borders on surfaces, `primary-text` (`#005185` light, `#7DB9E6` dark) and `danger-fg` (`#B42318` light, `#F28B82` dark). Backgrounds and surfaces go dark navy (`bg` `#0B141D`, `surface` `#14212E`), text goes near-white (`#E8EEF4`), and the tints become dark tints. The dark palette has not been checked against the contrast rule yet.

---

## 3. Typography

| Role | Font | Weight | Size | Notes |
|---|---|---|---|---|
| Screen title (header) | Barlow Condensed | 700 | 24–26 px | UPPERCASE, line-height 1 |
| Login app name | Barlow Condensed | 700 | 40 px | UPPERCASE, letter-spacing 1 px — "TURRES SCORER" |
| Section header | Barlow Condensed | 700 | 22 px | UPPERCASE ("SELECT STAGE", "SHOOTING ORDER") |
| Sheet title | Barlow Condensed | 700 | 26 px | UPPERCASE |
| Buttons | Barlow Condensed | 700 | 20–22 px | UPPERCASE, letter-spacing 0.5–1 px |
| Matrix cell / column head | Barlow Condensed | 700 | 22 px / 17 px | |
| Big numbers (time, points, HF) | Barlow Condensed | 700 | 28–30 px | |
| Body / list title | Inter | 700 | 15–16 px | |
| Secondary text | Inter | 400–600 | 12–14 px | |
| Micro labels | Inter | 700 | 10–11 px | e.g. `1 left`, "PAPER", "HIT TOTALS" (uppercase, +0.5 px tracking) |

Fonts: Google Fonts `Barlow Condensed:wght@600;700` and `Inter:wght@400;500;600;700`.

---

## 4. Shape, spacing, elevation

- Radii: matrix cells 8 · inputs / small tiles 10 · buttons, number tiles 12 · cards 14 · event cards 16 · sheet top corners 20 · login panel top corners 24 · chips 999.
- Screen side padding 12–16 px; gaps between cards 8–12 px; matrix row gap 9 px, cell gap 4 px.
- Touch targets: min 44 × 44 px; main action buttons 52–54 px tall.
- Elevation: cards are flat or `0 1px 2px rgba(14,42,71,.08)`; sticky bottom bar `0 -2px 8px rgba(14,42,71,.06)`; sheets `0 -8px 24px rgba(16,32,47,.18)`.

---

## 5. Components

### AppHeader
Plain header on the page background (`bg`), `text` colour, no bar or border. Left: 44 px back button (chevron-left icon, `aria-label` "Back to …"). Then title (Barlow 24–26, uppercase) and one-line subtitle (`text-secondary`, 13 px). The title block has a fixed height (title 26 px + subtitle line 18 px) even when there is no subtitle, so the title stays at the same position on every screen. The right slot holds the **UserMenu** on signed-in screens (see below). Matches has no back button.

### UserMenu
Avatar button in the header's right slot (44 px circle, initials, `primary` fill, white text; `aria-label` "User menu (email)"). Tapping it opens a popover under the avatar (white `surface`, 1 px `border-light`, radius 14, 288 px wide, sheet shadow). Content, top to bottom: a **user card** (initials circle, "Signed in as", email), a **theme row**, a **language row**, a divider, and **Sign out**. Rows are plain: a 22 px icon on the left and a label, min. 48 px tall, with **nothing on the right** (no switches, shortcuts or chevrons). The theme row names the mode you will switch **to** (light is on -> moon icon and "Dark mode"; dark is on -> sun icon and "Light mode"), and the language row names the language you will switch to (English is on -> globe and "Suomi"). Tapping either switches immediately and keeps the menu open. The menu closes on Escape, on a tap outside, and after signing out (which returns to Sign in). The theme row sets light or dark explicitly; "system" is only the default until the first choice. Sign in has no user menu and is always light; it keeps only a language button top right (globe icon and the name of the language you switch to, e.g. "Suomi" while English is on; the same rule as the menu's language row).

### SectionHeader
Row with section title (Barlow 22, uppercase) on the left and an optional **count** on the right: `**2 / 6** stages done`, `**3 / 8** scored` (number bold in `text`, rest `text-secondary`, 13 px).

### Segmented control (Matches: Open | Results)
White `surface` track, radius 12, 4 px padding, card shadow. Selected item: `primary` fill, white text. Unselected: transparent, `text-label` text. Height 40.

### ListCard (squad / stage / shooter row)
White card, radius 14 (shooters 12), padding 12–14. Left: 48 px number tile (radius 12). Middle: title + secondary lines. Right: status text and/or chevron. State styling:
- **Done**: tile `success-tint` / `success-text`, status "Done" in `success-text`.
- **Active** (On range / In progress / Shooting): tile `primary` with white number, 2 px `primary` border on the card; shooter row background `primary-tint`.
- **Not started**: tile `surface-tile` / `primary` text, status in `text-secondary`.

### ProgressBar
Track `divider`, fill `primary`, height 6–8 px, fully rounded.

### Buttons
- **Primary**: `primary` bg, white text, radius 12, height 52–54.
- **Secondary / outline**: white bg, 2 px `border`, `text-label` text.
- **Edit (outline primary)**: white bg, 2 px `primary` border, `primary` text.
- **Destructive outline (DQ)**: white bg, 2 px `danger` border, `danger` text.
- **Destructive solid (Confirm DQ)**: `danger` bg, white text.
- Links that look like buttons are `<a>` elements styled as above.

### ScoreMatrix
White card, radius 14, padding 10 × 8, row gap 9.
Grid columns: `38px | 1fr | 1fr | 1fr | 1fr | 44px` (label · A · C · D · M · undo).
- **Section label + column heads** ("PAPER" A C D M; "STEEL" A · · M). A/C/D heads in `primary`, M in `danger`.
- **RowLabelTile** (38 × 44, radius 8): row number (Barlow 20). Complete → `success` bg, white. Incomplete → `danger-tint` bg, `danger-text`, with micro label `N left` under the number.
- **MatrixCell** (button, 44 px tall, radius 8): empty → `surface-muted` bg, 1.5 px `border-light`, no text. Filled → `primary` bg (A/C/D) or `danger` bg (M), white count text.
- **Steel rows**: A cell, a 2-column placeholder tile reading "A or M" (`surface-muted`, 12 px `text-secondary`), M cell.
- **UndoButton** (44 × 44, radius 8, white, 1.5 px `border`): undo-arrow icon, `primary` when active, `disabled` colour + `disabled` attribute when the row is empty.

### Stepper (No-shoot, Procedural)
Row: label block (name 15 px bold + `Max N` 12 px `text-secondary`) · `−` button (44, outline) · count (Barlow 24) · `+` button (44, `primary`; `disabled` colour when at max). Two steppers stacked with 9 px gap.

### Sticky bottom bar (Scoring)
White, 1 px `border-light` top border, soft upward shadow. Contains the two steppers, then 16 px gap, then the action row: **DQ** (destructive outline) · **DNF** (outline) · **Review** (primary, fills remaining width). The matrix area above scrolls; the bar never scrolls away.

### BottomSheet
Full-screen `scrim` over the previous screen, sheet anchored to the bottom: radius 20 top corners, 10 px top padding, 40 × 5 grab handle (`border` colour) centred, content padding 12–20 px, ends with an action row (Cancel/Edit left, confirm right).

---

## 6. Screens

### 1 · Sign in
Full blue background. Upper area centred: club logo (104 px, `public/logo.png`), app name **TURRES SCORER**, sub-line "Powered by SSI". Bottom white panel (radius 24 top): title "SIGN IN", **Email** input, **Password** input (50 px tall, 1.5 px border, radius 10), right-aligned link "Forgot password?", primary button **Sign in**. No "keep me signed in", no sync message.

### 2 · Matches
Header: title **MATCHES**, the user menu (avatar). Segmented control **Open | Results** inside the header.
- *Open*: live and upcoming matches. *Results*: finished matches.
- Match card: name (Barlow 22), the date with year, `7.11.2026` (Finnish format; no range name), three stat tiles (Stages, Squads, Shooters). A live match also shows "Scored 223 / 384" with a progress bar. No status badge: a 6 px strip on the card's left edge shows the status (blue = live, green = finished, none = upcoming), and the status word is added for screen readers. Strip colours are the theme-aware tokens `primary-text` and `success-accent`.
- Tap card → Squads.

### 3 · Squads
Header: match name, subtitle `6 stages · 8 squads · 64 shooters`. Section header **SQUADS**.
List of squads (ListCard): `Squad N`, `8 shooters · Stage 3 · 2/6 done`, status (Done / On range / Not started), progress bar of stages done. Several squads can be **On range** at once. Tap → Stage selection.

### 4 · Stage selection
Header: `Squad 2`, subtitle `8 shooters`. Section header **SELECT STAGE** with count `2 / 6 stages done`.
Stage cards: number tile, stage name, status (Done / In progress / Not started), then three lines: the targets `6 paper · 3 steel · 2 no-shoots` (dot-separated, like the header subtitle), the shots `Minimum rounds: 15` (Finnish `Minimilaukausmäärä: 15`), and `3 / 8 scored`; chevron. Tap → Shooters. Stages are listed in number order. Status is per squad: Done = every shooter has a saved result (scored, DNF or DQ), In progress = some do (blue border and filled tile), Not started = none. Target counts of 0 are left out (`4 paper`), and the singular is used for 1.

### 5 · Shooters
Header: `Squad 2 · Stage 3`, subtitle with the stage's targets, dot-separated (`6 paper · 3 steel · 2 no-shoots`). The minimum rounds are left out of the subtitle because it does not fit next to the header controls; they are on the stage card. Section header **SHOOTING ORDER** with count `3 / 8 scored`.
Rows: order number, name, `#23` (competitor number; no division/gun type). Right side status:
- scored → HF value (e.g. `6.4213`) with caption "HF" in `success-text`
- **Shooting** (current) → `primary`, row highlighted (`primary-tint` bg, 2 px `primary` border)
- **On deck** (next) → `text-secondary`
- waiting → `—` (the word "Waiting" is added for screen readers)
- **DNF** → `text-secondary`. The shooter keeps their place in the order and the row stays selectable (so a mistaken DNF can be corrected). A DNF is a result: it counts as scored and the shooter never becomes "Shooting".
- **DQ** → `danger-fg`. A DQ removes the shooter from the **rest of the match**, so they are shown on every stage of the match: **last in the list, without an order number, dimmed and not selectable** (a plain row, not a link). Counting follows time: on the stage where the DQ happens it **counts as scored**, and so do stages where the shooter already had a result; on the stages after the DQ the shooter is not expected, so they are left out of the "scored" counts and do not hold up stage, squad or match progress.

"Shooting" is the first shooter in the order without a result and "On deck" the next one, so a skipped shooter stays "Shooting" until scored.
Tap → Scoring.

### 6 · Scoring
Header: shooter name, `#23 · Stage 3 · Squad 2`.
Scrollable content:
1. **Time card**: stopwatch icon, label "Time (s)", and a button (120 × 46, 2 px `primary` border, Barlow 28, right-aligned, placeholder `0.00`) that opens the **time keypad** instead of the phone keyboard (below).
2. **ScoreMatrix**: Paper rows 1…N, divider, Steel rows 1…S (see components and SCORING.md for behaviour).
Sticky bottom bar: **No-shoot** stepper (`Max = 2 × no-shoot targets`), **Procedural** stepper (`Max = ceil(maxPoints / 10)`), then **DQ · DNF · Review**. **Review is disabled** (disabled colour) until the score is complete: a time entered and every paper and steel target has all its hits. The red `N left` row tiles show which targets are missing, and an empty time shows `0.00` in the disabled colour.
No running points/HF summary on this screen — totals are shown in Review.

### Time keypad (bottom sheet over Scoring)
Opens when the time field is tapped. Title **TIME (S)**, a white card with the typed time large (Barlow 48, `0.00` in the disabled colour while empty) and the hint "The last two digits are decimals: 842 = 8.42". Below, a 3 × 4 grid of 64 px keys (Barlow 32): **1–9**, an empty cell, **0**, and **backspace** (icon, aria-label "Delete last digit"). There is no decimal key: digits shift in from the right, so 8, 4, 2 gives 8.42; leading zeros are ignored and at most 5 digits are taken. The action row has one **Done** button; Escape, Enter and a tap on the scrim also close it. On a physical keyboard, digits and Backspace work too.

### 6a · Confirm DQ (bottom sheet over Scoring)
White sheet (`surface`). The header row has a 44 px circle in `danger-tint` holding a `danger-fg` warning-triangle icon, and to its right the title **DISQUALIFY SHOOTER?** and the shooter line `Antti Mäkelä · #23 · Stage 3` (no squad).
`danger-tint` info box: "The shooter is removed from the rest of the match. This needs the Range Master's approval to reverse."
**Reason** select (Unsafe gun handling, Accidental discharge, Unsportsmanlike conduct, Other) and optional **Note** textarea.
Actions: **Cancel** (outline, closes the sheet and keeps the entered hits) · **Confirm DQ** (`danger` solid, a little wider). Confirming saves a DQ result for this stage: no time, no hits, the chosen reason (a code, e.g. `unsafe_handling`), the trimmed note if any (max 500 characters), no shooter sign-off. Anything already saved or entered on this stage is replaced. Then back to Shooters, where the shooter is now last, dimmed and not selectable, on every stage of the match (a DQ lasts for the rest of the match). The reason starts on the first choice each time and the note starts empty. While saving both buttons are disabled; a failed save keeps the sheet open with an error. The DQ button works with an incomplete score. There is no way to reverse a DQ in the app: the text says it needs the Range Master's approval.

### 6b · Confirm DNF (bottom sheet over Scoring)
White sheet (`surface`). The header row has a 44 px circle in `primary-tint` holding a `primary-text` circle-x icon, and to its right the title **MARK AS DNF?** and the shooter line `Antti Mäkelä · #23 · Stage 3` (no squad).
Info box (`bg`): "Stage 3 is recorded as Did Not Finish for this shooter. Hits entered on this stage are discarded."
**Reason** select (Equipment failure, Injury, Shooter withdrew, Other).
Actions: **Cancel** (outline, closes the sheet and keeps the entered hits) · **Confirm DNF** (primary, a little wider). Confirming saves a DNF result for this stage: no time, no hits, the chosen reason (stored as a code, e.g. `equipment_failure`), no shooter sign-off. Anything already saved or entered on this stage is replaced. Then back to Shooters, where the shooter shows **DNF** in their place (still selectable, so it can be corrected). The reason starts on the first choice each time. While saving both buttons are disabled; a failed save keeps the sheet open with an error. The DNF button works with an incomplete score.

### 7 · Review score (bottom sheet over Scoring)
Sheet background `bg`. Title **REVIEW SCORE**, shooter line.
1. Blue result card: **Time** `8.42 s` · **Points** `54` · **HF** `6.4133` (HF in `on-primary-accent`).
2. **Hit totals**: six tiles — A, C, D, M, NS, PE — count + points (`55p`, `-10p` …). M/NS/PE labels in `danger`.
3. **Targets**: Paper row of tiles `1 AA`, `2 AC`, … (a tile containing M uses `danger-tint` / `danger-text`); Steel row `1 A`, `2 A`, `3 A`.
4. **Shooter sign-off**: checkbox "Shooter has reviewed and accepts the score" (no signature pad).
Actions: **Edit** (outline primary) → back to Scoring · **Accept & save** (primary) → saves the score, then Shooters. Accept & save is disabled until the checkbox is ticked **and the score is complete** (a time entered and every paper and steel target has all its hits). An addition to the mock-up: otherwise an unfinished score would be saved with an HF of 0. Because Review is disabled until the score is complete, the sheet is only reachable with a complete score. The red box ("Enter the time before saving.", "N targets are not complete.") and the red `—` tiles are a safety net that also keeps Accept & save disabled. Tapping Edit goes back to fix it. While saving, both buttons are disabled; if saving fails, the sheet stays open with "Could not save the score. Try again." The checkbox starts unticked each time the sheet opens. Hit total tiles show the points per code (`55p`, `-10p`); NS and PE are not translated.

---

## 7. Iconography

Inline stroke SVG icons, 2–2.6 px stroke, `currentColor`, round caps: chevron-left (back), chevron-right (list), stopwatch, undo-arrow, minus, plus, warning triangle (DQ), circle-x (DNF). Decorative icons have `aria-hidden="true"`; icon-only buttons have `aria-label`. No emoji.

---

## 8. Sample content used in the mock-ups

All names, matches and stages are placeholders: matches "Autumn Match 2026", "Club Night Match #11", "Winter Cup · Round 1"; stages "Vehicle Stop", "Barricade", "Rapid Entry" (6 paper, 3 steel, 2 no-shoots, min. 15 rounds), "Long Corridor", "Strong Hand Only", "Casualty Drag"; range name `[RANGE NAME]`.

# DESIGN.md — TurRes Scorer

Visual design and screen specification. Behaviour and scoring rules are in **[SCORING.md](./SCORING.md)**.
Reference material for every screen is in `docs/design/`:
- **Images** (PNG/PDF exports of each screen) — the primary visual reference: match layout, hierarchy and look against these.
- **`*.dc.html` sources** — use for exact values (hex colours, px sizes, radii, copy) when the image is ambiguous. File names: `Main` = Sign in, `Events` = Matches, `Squads`, `Stages`, `Shooters`, `Scoring`, `Review`, `ConfirmDQ`, `ConfirmDNF`.

If an image and this document disagree, this document wins (it reflects the latest decisions). The images and `*.dc.html` files predate the **header, button, steel row, undo and stepper styles** described below (the Android-style "V2" look); build those from this document.
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
| `border` | `#C5CFDA` | Inputs, sheet handle |
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
| `danger` | `#B42318` | M cells, M/NS column heads, the red warning boxes |
| `danger-tint` | `#FBE4E2` | Incomplete row tile, DQ warning box, miss highlight |
| `danger-text` | `#8A1C12` | Text on `danger-tint` |
| `destructive` | `#BA1A1A` | Destructive **fill** (Confirm DQ, Discard), white text |
| `destructive-fg` | `#BA1A1A` | Destructive **outline and text** (the DQ button) |
| `neutral-outline` | `#72787E` | The 1 px outline of the neutral buttons (DNF, Cancel, Edit) |
| `tonal` / `on-tonal` | `#D3E4F2` / `#0B1D2A` | The stepper `−` button background and its icon |
| `header` | `rgba(249,249,249,0.96)` | The header bar background (slightly see-through) |
| `header-border` | `#D1D1D6` | The 1 px line under the header bar |
| `scrim` | `rgba(16,32,47,0.55)` | Overlay behind bottom sheets |

Contrast: all text pairs above meet WCAG AA (4.5:1) at the sizes used.

**Dark mode** (the tables above are the light palette). The choice is made with the theme row in the user menu on signed-in screens (light or dark); it is remembered. **Sign in is always light** (it ignores the saved theme and has no theme control). "System" follows `prefers-color-scheme`. The full dark palette lives in `app/globals.css`. Rules: `primary` and `danger` stay as fill colours with white text; two extra tokens cover text or borders on surfaces, `primary-text` (`#005185` light, `#7DB9E6` dark) and `danger-fg` (`#B42318` light, `#F28B82` dark). The same split applies to the destructive pair: `destructive` (`#BA1A1A` in both modes, fill) and `destructive-fg` (`#BA1A1A` light, `#F28B82` dark). `tonal` and `on-tonal` are the **same in both themes** (a light blue circle with a dark icon, so the enabled stepper minus reads as light blue on a dark surface too). Dark values of the other new tokens: `neutral-outline` `#8B949B`, `header` `rgba(11,20,29,0.96)` with `header-border` `#2A3B4D`. Backgrounds and surfaces go dark navy (`bg` `#0B141D`, `surface` `#14212E`), text goes near-white (`#E8EEF4`), and the tints become dark tints. The dark palette has not been checked against the contrast rule yet.

---

## 3. Typography

| Role | Font | Weight | Size | Notes |
|---|---|---|---|---|
| Screen title (header) | Barlow Condensed | 700 | 24 px | UPPERCASE, line-height 1 |
| Login app name | Barlow Condensed | 700 | 40 px | UPPERCASE, letter-spacing 1 px — "TURRES SCORER" |
| Section header | Barlow Condensed | 700 | 22 px | UPPERCASE ("SELECT STAGE", "SHOOTING ORDER") |
| Sheet title | Barlow Condensed | 700 | 26 px | UPPERCASE |
| Buttons | Inter | 600 | 15 px | Normal case, letter-spacing 0.1 px, no icons |
| Matrix cell / column head | Barlow Condensed | 700 | 22 px / 17 px | |
| Big numbers (time, points, HF) | Barlow Condensed | 700 | 28–30 px | |
| Body / list title | Inter | 700 | 15–16 px | |
| Secondary text | Inter | 400–600 | 12–14 px | |
| Micro labels | Inter | 700 | 10–11 px | e.g. `1 left`, "PAPER", "HIT TOTALS" (uppercase, +0.5 px tracking) |

Fonts: Google Fonts `Barlow Condensed:wght@600;700` and `Inter:wght@400;500;600;700`.

---

## 4. Shape, spacing, elevation

- Radii: matrix cells 8 · inputs / small tiles 10 · number tiles 12 · cards 14 · event cards 16 · sheet top corners 20 · login panel top corners 24 · **buttons and round icon buttons 999 (pills and circles)** · chips 999.
- Screen side padding 12–16 px; gaps between cards 8–12 px; matrix row gap 9 px, cell gap 4 px.
- Touch targets: min 44 × 44 px; every button is a 48 px tall pill; the header back button is 48 × 48 px.
- Elevation: cards are flat or `0 1px 2px rgba(14,42,71,.08)`; sticky bottom bar `0 -2px 8px rgba(14,42,71,.06)`; sheets `0 -8px 24px rgba(16,32,47,.18)`.

---

## 5. Components

### AppHeader
A light bar: background `header` (`rgba(249,249,249,0.96)`, slightly see-through, so content scrolling under it shows faintly), a **1 px `header-border` line** under it (always visible), `text` colour, no coloured bar. **Sticky**: it stays at the top while the page scrolls, so the shooter, the back arrow and the user menu are always visible (on Scoring it shows who is being scored). Layering: above the page and the bottom bar, below sheets; the user menu popover is inside it.
The bar is **64 px tall**, a flex row with the items centred, padding 0 4 px and a 4 px gap:
- **Back button**: a 48 × 48 px round icon button with **no text label**, `primary` colour, `aria-label` "Back to …" (for example "Back to shooters"). The icon is the Android arrow, 24 px, stroke 2: `<path d="M19 12H5M12 19l-7-7 7-7"/>`. Matches has no back button, and its title is indented 12 px so it lines up with the content below.
- **Title block**, left-aligned, filling the remaining width: the **name** in Barlow Condensed 700, 24 px, uppercase, line-height 1, `text` colour; the **subtitle** in Inter 13 px, `text-secondary`, 2 px under the name (for example `#23 · Stage 3 · Squad 2`). The block has a fixed height (24 px title + 2 px + an 18 px subtitle line) even with no subtitle or while loading, so the title stays at the same position on every screen.
- **Right slot**: the **UserMenu** avatar on signed-in screens (see below), with a 4 px margin to the edge.
Extra header content (the Open | Results control on Matches, the Stages | Shooters tabs) sits **under the 64 px bar** inside the same sticky header (12 px side padding, 12 px below), above the one hairline.

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
Every button is the same **pill**: height 48, fully rounded (radius 24), padding 0 20 px, Inter 15 px 600, letter-spacing 0.1 px, normal case, **no icons**. Outlines are 1 px and the background is transparent. Disabled buttons use the `disabled` colour (for outlines border and text, for fills the background).
- **Primary**: `primary` fill, white text (Review, Confirm DNF, Done, Sign in). May grow to fill the row (`flex-grow: 1`).
- **Neutral outline**: 1 px `neutral-outline` border, `primary` text (DNF, Cancel, Edit, Try again).
- **Primary outline**: 1 px `primary` border, `primary` text (Edit in the Review sheet, Keep editing, Next shooter in the toast).
- **Destructive outline (DQ)**: 1 px `destructive-fg` (`#BA1A1A`) border, `destructive-fg` text.
- **Destructive solid (Confirm DQ, Discard)**: `destructive` (`#BA1A1A`) fill, white text.
- Links that look like buttons are `<a>` elements styled as above. Round **icon buttons** are separate: see below.

### Icon buttons
Round, 44 × 44 px (the header back button 48 × 48), always with an `aria-label`. **Plain**: transparent, no border, `primary` icon, `disabled` colour when disabled (the header back arrow, the per-row undo). **Tonal**: `tonal` fill with an `on-tonal` icon (the stepper `−`); disabled, the whole button fades to 60% opacity instead of greying the icon, because a grey icon on the pale `tonal` fill is below 2:1 contrast. **Solid**: `primary` fill, white icon, `disabled` fill when disabled (the stepper `+`, the user avatar).

### ScoreMatrix
White card, radius 14, padding 10 × 8, row gap 9.
Grid columns: `38px | 1fr | 1fr | 1fr | 1fr | 44px` (label · A · C · D · M · undo).
- **Section label + column heads**: "PAPER" with the column heads A C D M (A/C/D in `primary`, M in `danger`). **"STEEL" has only the section label** (11 px, 700, uppercase, `text-label`) and no column-head row: its cells always show their own letter.
- **RowLabelTile** (38 × 44, radius 8): row number (Barlow 20). Complete → `success` bg, white. Incomplete → `danger-tint` bg, `danger-text`, with micro label `N left` under the number. The label cannot wrap and must fit the 38 px tile, so its translation is kept to 8 characters at most (English `2 left`, Finnish `2 vielä`; a test guards this).
- **MatrixCell** (button, 44 px tall, radius 8): empty → `surface-muted` bg, 1.5 px `border-light`, no text. Filled → `primary` bg (A/C/D) or `danger` bg (M), white count text.
- **Steel rows**: label tile · **A cell** · the text "A or M" · **M cell** · undo. The A and M cells always show their letter (Barlow Condensed 700, 22 px, 44 px tall, radius 8, 1.5 px border). **Not selected**: `surface-muted` background, `border-light` border, the letter in `primary` (A) or `danger` (M). **Selected**: solid `primary` (A) or `danger` (M) background, white letter, transparent border (`aria-pressed`). A and M are mutually exclusive, as before. "A or M" is plain text (13 px, `text-secondary`) spanning two columns, with no background or border.
- **UndoButton** (a plain round icon button, 44 × 44, transparent, no border): undo-arrow icon 22 px, stroke 2.2, `primary` when active, `disabled` colour + `disabled` attribute when the row is empty.

### Stepper (No-shoot, Procedural)
Row: label block (name Inter 15 px 700 + `Max N` Inter 12 px `text-secondary`) · `−` (44 px circle, `tonal` fill, `on-tonal` icon; at 0 the whole button fades to 60% opacity, the icon keeps its colour) · count (Barlow Condensed 700, 24 px, min-width 28) · `+` (44 px circle, `primary` fill, white icon; `disabled` fill when at max). Icons are 20 px, stroke 2.4. Two steppers stacked with 9 px gap.

### Sticky bottom bar (Scoring)
White, 1 px `border-light` top border, soft upward shadow, padding 8 px 12 px 16 px. Contains the two steppers, then a 16 px gap, then the action row (gap 8 px) of three pills: **DQ** (destructive outline) · **DNF** (neutral outline) · **Review** (primary, fills the remaining width). The matrix area above scrolls; the bar never scrolls away.

### BottomSheet
Full-screen `scrim` over the previous screen, sheet anchored to the bottom: radius 20 top corners, 10 px top padding, 40 × 5 grab handle (`border` colour) centred, content padding 12–20 px, ends with an action row (Cancel/Edit left, confirm right).

Behaviour (a native modal `<dialog>`, see `shared/ui/Dialog.tsx`): the page behind is inert and cannot scroll; Tab and Shift+Tab move between the sheet's controls and never reach the page behind (they may pass through the browser's own address bar); **Escape and a tap on the empty area above the sheet ask to close it** (a sheet that is saving ignores them); when it closes, focus goes back to the button that opened it. On opening, focus is on the sheet itself, not on its first control, so no field is highlighted when it appears; the sheet is announced with its title.

---

## 6. Screens

### 1 · Sign in
Full blue background. Upper area centred: club logo (104 px, `public/logo.png`), app name **TURRES SCORER**, sub-line "Integrated with Shoot'n Score It" (14 px; **not translated**: the same English text in Finnish, marked `lang="en"` for screen readers) where the service name is a link to https://www.shootnscoreit.com/ (white, underlined, semibold, a 44 px tap target). It opens outside the app (`target="_blank"`, `rel="noopener noreferrer"`, via `shared/ui/ExternalLink`), also when the app is installed as a PWA; screen readers hear "(opens in the browser)". Bottom white panel (radius 24 top): title "SIGN IN", **Email** input, **Password** input (50 px tall, 1.5 px border, radius 10), primary button **Sign in** (it reads "Signing in…" while busy). The mock-up's "Forgot password?" link is left out until an auth provider exists: an inert link looks broken. No "keep me signed in", no sync message.

### 2 · Matches
Header: title **MATCHES**, the user menu (avatar). Segmented control **Open | Results** inside the header.
- *Open*: live and upcoming matches. *Results*: finished matches.
- Match card: name (Barlow 22), the date with year, `7.11.2026` (Finnish format; no range name), three stat tiles (Stages, Squads, Shooters). A live match also shows "Scored 223 / 384" with a progress bar. No status badge: a 6 px strip on the card's left edge shows the status (blue = live, green = finished, none = upcoming), and the status word is added for screen readers. Strip colours are the theme-aware tokens `primary-text` and `success-accent`.
- Tap card → Stages.

### 3 · Stages (the match view)
The order of the flow follows the range: a Range Officer stands at **one stage and the squads rotate through it**, so the match leads to its stages, a stage to its squads, a squad to its shooters. (The mock-up images and `*.dc.html` for the old screens 3 "Squads" and 4 "Stage selection" show the earlier order and are stale; this file wins.)

Header: match name, subtitle `6 stages · 8 squads · 64 shooters`, back arrow to Matches. Under it a two-tab control **Stages | Shooters** (same look as the Open | Results control, but two pages with their own URLs: `/matches/[id]` and `/matches/[id]/roll-call`, real links with `aria-current`; both pages use the same header subtitle). Section header **SELECT STAGE** with count `2 / 6 stages done`.
Stage cards (ListCard): number tile, stage name, status (Done / In progress / Not started), then three lines: the targets `6 paper · 3 steel · 2 no-shoots` (dot-separated, like the header subtitle), the shots `Minimum rounds: 15` (Finnish `Minimilaukausmäärä: 15`), and `32 / 63 scored`, then a progress bar; chevron. Tap → the squads of that stage. Stages are listed in number order. **Status is over every squad**: Done = every expected shooter of every squad has a saved result (scored, DNF or DQ), In progress = some do (blue border and filled tile), Not started = none. The scored count is over all squads and leaves out shooters who are not expected (disqualified or DNS). Target counts of 0 are left out (`4 paper`), and the singular is used for 1.

### 4 · Squads (on a stage)
Header: `Stage 3`, subtitle the stage name (`Rapid Entry`), back arrow to the stages. Section header **SQUADS** with count `4 / 8 squads done`.
Squad cards (ListCard): number tile, `Squad N`, status (Done / In progress / Not started), the line `8 shooters · 5 / 8 scored` and a progress bar; chevron. Tap → Shooters of that squad on this stage. Squads are listed in **squad number** order. Status is the squad's progress **on this stage only**, with the same rules as the stage cards. Several squads can be In progress at once.

### 3a · Shooters (second tab of the match view, where DNS is marked)
The same header as Squads (match name, subtitle `6 stages · 8 squads · 64 shooters`, back arrow to Matches) and the **Stages | Shooters** tabs, Shooters current. Section header **SHOOTERS**. Then one group per squad, in squad order, **always open** (nothing collapses): a heading row (44 px, a real `<h3>`) with `SQUAD 6` (Barlow 22, uppercase) and on the right `8 shooters`, then its shooters in shooting order as white cards: name and `#number`, and a single 44 px **DNS** button (min width 76 px, Barlow 18 uppercase). **Everyone is present by default**: there is no Here button, no confirmation and no Mark all present; the only action is marking a shooter who did not show. A marked shooter has the DNS button filled (`text-label` with `bg` text, `aria-pressed`); tapping it again takes the mark back. A shooter disqualified from the match is dimmed with a red **DQ** and no button, listed last. Every tap is saved at once and shown at once. A mark stays until someone changes it, also on a later day. There is no gate and no progress counter: Stage selection opens for any squad.

### 5 · Shooters
Header: `Squad 2 · Stage 3`, back arrow to the squads of the stage, subtitle with the stage's targets, dot-separated (`6 paper · 3 steel · 2 no-shoots`). The minimum rounds are left out of the subtitle because it does not fit next to the header controls; they are on the stage card in the match view. Section header **SHOOTING ORDER** with count `3 / 8 scored`.
Rows: order number, name, `#23` (competitor number; no division/gun type). Right side status:
- scored → HF value (e.g. `6.4213`) with caption "HF" in `success-text`
- **Shooting** (current) → `primary`, row highlighted (`primary-tint` bg, 2 px `primary` border)
- **On deck** (next) → `text-secondary`
- waiting → `—` (the word "Waiting" is added for screen readers)
- **DNS** → `text-secondary`. A shooter who was marked DNS (did not show) is **last, dimmed, without an order number and not selectable** (a plain row), like a DQ but not red. A DNS shooter is not expected on this stage unless they already have a result on it (then they stay in the order as scored), so they are left out of the "scored" counts and never become "Shooting" or "On deck".
- **DNF** → `text-secondary`. The shooter keeps their place in the order and the row stays selectable (so a mistaken DNF can be corrected). A DNF is a result: it counts as scored and the shooter never becomes "Shooting".
- **DQ** → `danger-fg`. A DQ removes the shooter from the **rest of the match**, so they are shown on every stage of the match: **last in the list, without an order number, dimmed and not selectable** (a plain row, not a link). Counting follows time: on the stage where the DQ happens it **counts as scored**, and so do stages where the shooter already had a result; on the stages after the DQ the shooter is not expected, so they are left out of the "scored" counts and do not hold up stage, squad or match progress.

"Shooting" is the first shooter in the order without a result and "On deck" the next one, so a skipped shooter stays "Shooting" until scored.
Tap → Scoring.

### 6 · Scoring
Header: shooter name, `#23 · Stage 3 · Squad 2` (the AppHeader: light bar, Android back arrow, see above).
Scrollable content:
1. **Time card**: stopwatch icon, label "Time (s)", and a button (120 × 46, 2 px `primary` border, Barlow 28, right-aligned, placeholder `0.00`) that opens the **time keypad** instead of the phone keyboard (below).
2. **ScoreMatrix**: Paper rows 1…N, divider, Steel rows 1…S (see components and SCORING.md for behaviour).
Sticky bottom bar: **No-shoot** stepper (`Max = 2 × no-shoot targets`), **Procedural** stepper (`Max = ceil(maxPoints / 10)`), then **DQ · DNF · Review**. **Review is disabled** (disabled colour) until the score is complete: a time entered and every paper and steel target has all its hits. The red `N left` row tiles show which targets are missing, and an empty time shows `0.00` in the disabled colour.
No running points/HF summary on this screen — totals are shown in Review.

**Read-only mode.** When the shooter already has a saved result for this stage, the screen opens read only instead of the entry form: the same summary as the Review sheet (blue Time / Points / HF card, hit totals, hits per target), with no sign-off box, and a full-width **Edit** button (secondary = outline style) in a sticky bar at the bottom. There are no DQ, DNF or Review buttons in this mode. Tapping **Edit** switches to the entry form, filled from the saved score (a saved DNF starts empty); saving from there replaces the result. For a saved **DNF** the summary is replaced by a blue "Result: DNF" card with the reason (and note, if any). In edit mode a blue strip above the time card says "Editing the saved score" with a **Cancel edit** link that returns to read-only. **Leaving with unsaved changes asks first**: the back arrow, Cancel edit and closing the tab show a "Discard changes?" sheet (**Keep editing** / **Discard**) whenever the entry differs from where it started (a saved score, or empty for a new one). Nothing is asked when nothing changed. A shooter without a saved result opens straight in the entry form.

### Time keypad (bottom sheet over Scoring)
Opens when the time field is tapped. Title **TIME (S)**, a white card with the typed time large (Barlow 48, `0.00` in the disabled colour while empty) and the hint "The last two digits are decimals: 842 = 8.42". Below, a 3 × 4 grid of 64 px keys (Barlow 32): **1–9**, **C** (clear: removes the whole time, aria-label "Clear time"), **0**, and **backspace** (icon, aria-label "Delete last digit"). There is no decimal key: digits shift in from the right, so 8, 4, 2 gives 8.42; leading zeros are ignored and at most 5 digits are taken. The action row has one **Done** button; Escape, Enter and a tap on the scrim also close it. On a physical keyboard, digits and Backspace work too.

### 6a · Confirm DQ (bottom sheet over Scoring)
White sheet (`surface`). The header row has a 44 px circle in `danger-tint` holding a `danger-fg` warning-triangle icon, and to its right the title **DISQUALIFY SHOOTER?** and the shooter line `Antti Mäkelä · #23 · Stage 3` (no squad).
`danger-tint` info box: "The shooter is removed from the rest of the match. This needs the Range Master's approval to reverse."
**Reason** select (Unsafe gun handling, Accidental discharge, Unsportsmanlike conduct, Other) and optional **Note** textarea.
The screen dimmed behind the sheet shows the same light header as the rest of the app. Actions (two pills): **Cancel** (neutral outline, `flex: 1 1 0`, closes the sheet and keeps the entered hits) · **Confirm DQ** (`destructive` `#BA1A1A` fill, white text, `flex: 1.4 1 0`). Confirming saves a DQ result for this stage: no time, no hits, the chosen reason (a code, e.g. `unsafe_handling`), the trimmed note if any (max 500 characters), no shooter sign-off. Anything already saved or entered on this stage is replaced. Then back to Shooters, where the shooter is now last, dimmed and not selectable, on every stage of the match (a DQ lasts for the rest of the match). The reason starts on the first choice each time and the note starts empty. While saving both buttons are disabled; a failed save keeps the sheet open with an error. The DQ button works with an incomplete score. There is no way to reverse a DQ in the app: the text says it needs the Range Master's approval.

### 6b · Confirm DNF (bottom sheet over Scoring)
White sheet (`surface`). The header row has a 44 px circle in `primary-tint` holding a `primary-text` circle-x icon, and to its right the title **MARK AS DNF?** and the shooter line `Antti Mäkelä · #23 · Stage 3` (no squad).
Info box (`bg`): "Stage 3 is recorded as Did Not Finish for this shooter. Hits entered on this stage are discarded."
**Reason** select (Equipment failure, Injury, Shooter withdrew, Other).
Actions (two pills): **Cancel** (neutral outline, `flex: 1 1 0`, closes the sheet and keeps the entered hits) · **Confirm DNF** (primary, `flex: 1.4 1 0`). Confirming saves a DNF result for this stage: no time, no hits, the chosen reason (stored as a code, e.g. `equipment_failure`), no shooter sign-off. Anything already saved or entered on this stage is replaced. Then back to Shooters, where the shooter shows **DNF** in their place (still selectable, so it can be corrected). The reason starts on the first choice each time. While saving both buttons are disabled; a failed save keeps the sheet open with an error. The DNF button works with an incomplete score.

### 7 · Review score (bottom sheet over Scoring)
Sheet background `bg`. Title **REVIEW SCORE**, shooter line.
1. Blue result card: **Time** `8.42 s` · **Points** `54` · **HF** `6.4133` (HF in `on-primary-accent`).
2. **Hit totals**: six tiles — A, C, D, M, NS, PE — count + points (`55p`, `-10p` …). M/NS/PE labels in `danger`.
3. **Targets**: Paper row of tiles `1 AA`, `2 AC`, … (a tile containing M uses `danger-tint` / `danger-text`); Steel row `1 A`, `2 A`, `3 A`.
4. **Shooter sign-off**: checkbox "Shooter has reviewed and accepts the score" (no signature pad).
Actions: **Edit** (outline primary) → back to Scoring · **Accept & save** (primary) → saves the score, then Shooters. Accept & save is disabled until the checkbox is ticked **and the score is complete** (a time entered and every paper and steel target has all its hits). An addition to the mock-up: otherwise an unfinished score would be saved with an HF of 0. Because Review is disabled until the score is complete, the sheet is only reachable with a complete score. The red box ("Enter the time before saving.", "N targets are not complete.") and the red `—` tiles are a safety net that also keeps Accept & save disabled. Tapping Edit goes back to fix it. While saving, both buttons are disabled; if saving fails, the sheet stays open with "Could not save the score. Try again." The checkbox starts unticked each time the sheet opens. Hit total tiles show the points per code (`55p`, `-10p`); NS and PE are not translated.

### Complete match (button, status block and bottom sheet on the Stages view)
**Button.** While the match is **live**, a full-width outline button **Complete match** sits under the stage list (an upcoming match has none, there is nothing to complete). Placed at the very bottom, far from the lists' tap targets, so it is not hit by accident. **It is disabled until every stage is done** (every expected shooter of every squad has a result; a stage nobody is expected on does not hold it up), and a centred hint under it says why: `Complete every stage first: 4 / 6 stages done.` (`aria-describedby` links the two). The hint disappears once the button is enabled.
**Status block.** Once completed the button is replaced by a green block (`success-tint`, `success-text`, check icon): `Completed 7.11.2026 · Results: Participants only`. A finished sample match shows the default, **Participants only**, until the organiser's system supplies one. The match is listed under **Results** on Matches.
**Sheet.** A white bottom sheet (same family as Confirm DNF and DQ): a 44 px circle in `primary-tint` with a warning icon, title **COMPLETE MATCH?**, the match name under it. An info box (`bg`): "Scoring is locked for everyone and this cannot be undone in the app." Then the radio group **Who can see the results**, three rows of at least 44 px, the selected one outlined in `primary` on `primary-tint`: **Everyone** ("Anyone with the link can see the results."), **Participants only** ("Only the shooters of this match.", the default each time the sheet opens), **Organisers only** ("Hidden until an organiser publishes them."). They are native radio buttons: arrow keys move the choice. Actions: **Cancel** (outline) · **Complete match** (primary, a little wider). While saving both are disabled and Escape or a tap outside is ignored; a failed save keeps the sheet open with an error. On success the sheet closes, a toast says "Match completed" and the screen shows the status block.
**Visibility is stored, not enforced.** The choice is saved on the match (`resultsVisibility`, `completedAt`, `completedBy`). There is no results screen yet, so nothing in the app hides data; a results view and the export must honour it.
**Read only.** A completed match is locked everywhere: a saved result opens read only **without the Edit button**; a shooter without a result shows "This match is completed." instead of the entry form; on the Shooters tab the DNS buttons are disabled (dimmed) under the note "This match is completed." The repository also refuses scores and roll call marks for a completed match, so a stale screen cannot save.

### Toast (confirmation after saving)
After a result is saved (scored, DNF or DQ) the app returns to Shooters and shows a toast at the bottom: a white card with a 4 px `success-accent` left edge, a check icon, one message, and a 44 px close button. Messages: `Antti Mäkelä: 8.42 s · HF 4.2310 saved`, `…: marked DNF`, `…: disqualified`. When someone in the squad still has no result on this stage it also shows a full-width **Next shooter** button (outline primary, opens that shooter) under the message. `role="status"`, so screen readers announce it without taking focus; it closes by itself after 6 s or with the close button. The shooter's row on Shooters is scrolled into view and highlighted green (`success-tint` fill, `success-accent` border) while the toast shows, and the list gets extra bottom padding so the toast never hides the last row. After saving the app uses `replace`, so Back does not reopen the score page.

### Load errors
When a screen cannot load its data it shows the message and a **Try again** button (outline) instead of needing a page reload.

---

## 7. Iconography

Inline stroke SVG icons, 2–2.6 px stroke, `currentColor`, round caps: arrow-left (the Android back arrow in the header), chevron-right (list), stopwatch, undo-arrow, minus, plus, warning triangle (DQ), circle-x (DNF), check and close (toast and the completed status). Decorative icons have `aria-hidden="true"`; icon-only buttons have `aria-label`. No emoji.

---

## 8. Sample content used in the mock-ups

All names, matches and stages are placeholders: matches "Autumn Match 2026", "Club Night Match #11", "Winter Cup · Round 1"; stages "Vehicle Stop", "Barricade", "Rapid Entry" (6 paper, 3 steel, 2 no-shoots, min. 15 rounds), "Long Corridor", "Strong Hand Only", "Casualty Drag"; range name `[RANGE NAME]`.

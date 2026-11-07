# 0006: DNS as a reversible status, marked on a Shooters tab

**Status:** accepted (confirmed by the product owner)

**Context.** Some shooters do not show, and the app had no way to say so, so a shooter who never came held up every stage, squad and match count. A first design was a roll call with a Here/DNS choice per shooter, repeated each day, as a per-squad step and then as a tab with counters; testing showed it was too much work for what matters, which is only who did not come.

**Decision.** Everyone is present by default. The match view has a second tab, **Shooters**, listing every squad, always open, with its shooters, and the only action is a **DNS** button per shooter (tap again to take it back, which saves a "present" record). Any range officer can do it, it is a status only, and nothing gates the stages. A mark belongs to the day it was made (`Attendance`, one record per shooter per day, Europe/Helsinki from the repository clock) and the **latest** record decides, so a mark stays until someone changes it, also on a later day. A DNS shooter is not expected on a stage unless they already have a result there, the same pattern as a DQ, decided in `shared/domain/progress.ts`.

**Consequences.** A new IndexedDB store (database version 2, an upgrade that only creates what is missing) and two repository methods, `listAttendance` and `saveAttendance`; the future API needs matching endpoints. A DNS from an earlier day carries over, so a shooter who shows up on day two must be taken off by hand. The time zone is fixed until match data carries its own. SSI may have its own check-in, to be checked when its API is known.

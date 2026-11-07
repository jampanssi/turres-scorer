import type { Repository } from "@/shared/data/repository";
import { dayOf, dnsShooterIds } from "@/shared/domain/attendance";
import { disqualifiedShooterIds } from "@/shared/domain/disqualified";
import type { Attendance, Match, Shooter, Squad } from "@/shared/domain/types";

export interface ShooterRowData {
  shooter: Shooter;
  /** Marked DNS (did not show). Everyone else is present. */
  dns: boolean;
  /** Disqualified from the match: listed last, cannot be marked. */
  disqualified: boolean;
}

/**
 * The rows of one squad: shooters in shooting order, with shooters disqualified from the match moved to
 * the end. A shooter is DNS when their latest record says so (see `shared/domain/attendance.ts`).
 */
export function buildRoster(
  shooters: readonly Shooter[],
  records: readonly Attendance[],
  disqualified: ReadonlySet<string>,
): ShooterRowData[] {
  const dns = dnsShooterIds(records);
  const rows = shooters.map((shooter) => ({
    shooter,
    dns: dns.has(shooter.id),
    disqualified: disqualified.has(shooter.id),
  }));
  return [...rows.filter((r) => !r.disqualified), ...rows.filter((r) => r.disqualified)];
}

export interface RosterSquad {
  squad: Squad;
  rows: ShooterRowData[];
}

export interface RosterOverview {
  match: Match;
  /** Today, "YYYY-MM-DD": the day a new mark is recorded on. */
  day: string;
  stageCount: number;
  shooterCount: number;
  /** Every squad of the match, in squad order. */
  squads: RosterSquad[];
}

/** Everything the Shooters tab needs: every squad of the match with its shooters. Null if the match does not exist. */
export async function loadRoster(repo: Repository, matchId: string): Promise<RosterOverview | null> {
  const match = await repo.getMatch(matchId);
  if (!match) return null;

  const [stages, squadList, scores, records] = await Promise.all([
    repo.listStages(matchId),
    repo.listSquads(matchId),
    repo.listScores(matchId),
    repo.listAttendance(matchId),
  ]);
  const disqualified = disqualifiedShooterIds(scores);
  const squads = await Promise.all(
    squadList.map(async (squad): Promise<RosterSquad> => ({
      squad,
      rows: buildRoster(await repo.listShooters(squad.id), records, disqualified),
    })),
  );

  return {
    match,
    day: dayOf(repo.now()),
    stageCount: stages.length,
    shooterCount: squadList.reduce((n, s) => n + s.shooterIds.length, 0),
    squads,
  };
}

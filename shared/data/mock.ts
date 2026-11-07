import type { Match, Shooter, Squad, Stage } from "@/shared/domain/types";

/** Placeholder catalog based on docs/DESIGN.md §8. Replaced by SSI data later. */

export interface Catalog {
  matches: Match[];
  stages: Stage[];
  squads: Squad[];
  shooters: Shooter[];
}

interface StageDef {
  name: string;
  paper: number;
  steel: number;
  noShoot: number;
}

const STAGE_DEFS: StageDef[] = [
  { name: "Vehicle Stop", paper: 5, steel: 2, noShoot: 1 },
  { name: "Barricade", paper: 6, steel: 1, noShoot: 2 },
  { name: "Rapid Entry", paper: 6, steel: 3, noShoot: 2 }, // stage 3 in the mock-ups: min. 15 rounds
  { name: "Long Corridor", paper: 8, steel: 0, noShoot: 2 },
  { name: "Strong Hand Only", paper: 4, steel: 2, noShoot: 0 },
  { name: "Casualty Drag", paper: 6, steel: 2, noShoot: 3 },
];

const FIRST_NAMES = ["Mikko", "Jari", "Timo", "Juha", "Pekka", "Ville", "Sami", "Kalle"];
const LAST_NAMES = ["Mäkelä", "Virtanen", "Korhonen", "Nieminen", "Heikkinen", "Laine", "Koskinen", "Järvinen"];
const SHOOTERS_PER_SQUAD = 8;

interface MatchConfig {
  id: string;
  name: string;
  date: string;
  status: Match["status"];
  stageCount: number;
  squadCount: number;
}

const MATCHES: MatchConfig[] = [
  { id: "autumn-2026", name: "Autumn Match 2026", date: "2026-11-07", status: "live", stageCount: 6, squadCount: 8 },
  { id: "club-night-11", name: "Club Night Match #11", date: "2026-11-21", status: "open", stageCount: 4, squadCount: 3 },
  { id: "winter-cup-1", name: "Winter Cup · Round 1", date: "2026-02-14", status: "finished", stageCount: 5, squadCount: 4 },
];

function shooterName(n: number): string {
  if (n === 23) return "Antti Mäkelä"; // the shooter in the mock-ups
  return `${FIRST_NAMES[(n - 1) % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor((n - 1) / FIRST_NAMES.length) % LAST_NAMES.length]}`;
}

export function buildMockCatalog(): Catalog {
  const catalog: Catalog = { matches: [], stages: [], squads: [], shooters: [] };

  for (const config of MATCHES) {
    const stages: Stage[] = STAGE_DEFS.slice(0, config.stageCount).map((def, i) => ({
      id: `${config.id}-st${i + 1}`,
      matchId: config.id,
      number: i + 1,
      name: def.name,
      minRounds: def.paper * 2 + def.steel,
      paperTargets: def.paper,
      steelTargets: def.steel,
      noShootTargets: def.noShoot,
    }));

    const shooters: Shooter[] = [];
    const squads: Squad[] = [];
    for (let s = 0; s < config.squadCount; s++) {
      const squadShooters: Shooter[] = [];
      for (let k = 0; k < SHOOTERS_PER_SQUAD; k++) {
        const n = s * SHOOTERS_PER_SQUAD + k + 1;
        squadShooters.push({ id: `${config.id}-sh${n}`, name: shooterName(n), competitorNumber: n });
      }
      shooters.push(...squadShooters);
      // Each squad starts on a different stage and rotates through all of them.
      const rotation = stages.map((_, i) => stages[(s + i) % stages.length].id);
      squads.push({
        id: `${config.id}-sq${s + 1}`,
        matchId: config.id,
        number: s + 1,
        shooterIds: squadShooters.map((x) => x.id),
        stageRotation: rotation,
      });
    }

    catalog.matches.push({
      id: config.id,
      name: config.name,
      date: config.date,
      range: "[RANGE NAME]",
      status: config.status,
      stageIds: stages.map((x) => x.id),
      squadIds: squads.map((x) => x.id),
    });
    catalog.stages.push(...stages);
    catalog.squads.push(...squads);
    catalog.shooters.push(...shooters);
  }

  return catalog;
}

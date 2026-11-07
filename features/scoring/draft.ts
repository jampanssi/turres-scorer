import type { HitCode, Stage, StageScore, SteelHit } from "@/shared/domain/types";
import { addPaperHit, setSteelHit, undoPaperHit, undoSteelHit } from "./entry";
import { maxNoShoots, maxProcedurals } from "./rules";

/**
 * The score being entered on the Scoring screen, before it is reviewed and saved.
 * Pure functions, no React: every update returns a new draft.
 */
export interface ScoreDraft {
  /** The time exactly as typed (may use `,`); parse with parseTime() when needed. */
  timeText: string;
  /** One row per paper target, up to two hits each (tap order). */
  paper: HitCode[][];
  /** One entry per steel target. */
  steel: SteelHit[];
  noShoots: number;
  procedurals: number;
}

type TargetCounts = Pick<Stage, "paperTargets" | "steelTargets">;
type PenaltyLimits = Pick<Stage, "paperTargets" | "steelTargets" | "noShootTargets">;

export function emptyDraft(stage: TargetCounts): ScoreDraft {
  return {
    timeText: "",
    paper: Array.from({ length: stage.paperTargets }, () => []),
    steel: Array.from({ length: stage.steelTargets }, () => null),
    noShoots: 0,
    procedurals: 0,
  };
}

/** Start from a saved result so it can be corrected. DNF and DQ results carry no hits: start empty. */
export function draftFromScore(score: StageScore | null, stage: PenaltyLimits): ScoreDraft {
  if (!score || score.status !== "scored") return emptyDraft(stage);
  const draft = emptyDraft(stage);
  return {
    timeText: score.timeSec === null ? "" : String(score.timeSec),
    paper: draft.paper.map((_, i) => [...(score.paper[i] ?? [])]),
    steel: draft.steel.map((_, i) => score.steel[i] ?? null),
    noShoots: Math.min(score.noShoots, maxNoShoots(stage.noShootTargets)),
    procedurals: Math.min(score.procedurals, maxProcedurals(stage.paperTargets, stage.steelTargets)),
  };
}

const replaceAt = <T,>(items: T[], index: number, value: T): T[] => items.map((item, i) => (i === index ? value : item));

export function tapPaper(draft: ScoreDraft, row: number, hit: HitCode): ScoreDraft {
  if (row < 0 || row >= draft.paper.length) return draft;
  return { ...draft, paper: replaceAt(draft.paper, row, addPaperHit(draft.paper[row], hit)) };
}

export function undoPaper(draft: ScoreDraft, row: number): ScoreDraft {
  if (row < 0 || row >= draft.paper.length) return draft;
  return { ...draft, paper: replaceAt(draft.paper, row, undoPaperHit(draft.paper[row])) };
}

export function tapSteel(draft: ScoreDraft, row: number, hit: Exclude<SteelHit, null>): ScoreDraft {
  if (row < 0 || row >= draft.steel.length) return draft;
  return { ...draft, steel: replaceAt(draft.steel, row, setSteelHit(hit)) };
}

export function undoSteel(draft: ScoreDraft, row: number): ScoreDraft {
  if (row < 0 || row >= draft.steel.length) return draft;
  return { ...draft, steel: replaceAt(draft.steel, row, undoSteelHit()) };
}

const clamp = (value: number, max: number) => Math.max(0, Math.min(max, Math.trunc(value)));

export function setNoShoots(draft: ScoreDraft, value: number, stage: PenaltyLimits): ScoreDraft {
  return { ...draft, noShoots: clamp(value, maxNoShoots(stage.noShootTargets)) };
}

export function setProcedurals(draft: ScoreDraft, value: number, stage: PenaltyLimits): ScoreDraft {
  return { ...draft, procedurals: clamp(value, maxProcedurals(stage.paperTargets, stage.steelTargets)) };
}

/**
 * Keep only what a time can contain: digits and one separator (`.` or `,`) with at most two
 * decimals and three integer digits.
 */
export function sanitizeTimeInput(text: string): string {
  const cleaned = text.replace(/[^0-9.,]/g, "");
  const separatorAt = cleaned.search(/[.,]/);
  if (separatorAt === -1) return cleaned.slice(0, 3);

  const integerPart = cleaned.slice(0, separatorAt).slice(0, 3);
  const decimals = cleaned.slice(separatorAt + 1).replace(/[.,]/g, "").slice(0, 2);
  return `${integerPart}${cleaned[separatorAt]}${decimals}`;
}

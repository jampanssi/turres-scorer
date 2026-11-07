import type { HitCode, Stage, StageScore, SteelHit } from "@/shared/domain/types";
import { addPaperHit, setSteelHit, undoPaperHit, undoSteelHit } from "./entry";
import { maxNoShoots, maxProcedurals } from "@/shared/domain/scoring";

/**
 * The score being entered on the Scoring screen, before it is reviewed and saved.
 * Pure functions, no React: every update returns a new draft.
 */
export interface ScoreDraft {
  /**
   * The time as the digits typed on the keypad. The last two digits are the decimals: "842" is 8.42 s.
   * No leading zeros; "" means no time yet. At most 5 digits (999.99 s).
   */
  timeDigits: string;
  /** One row per paper target, up to the stage's hits per paper target (tap order). */
  paper: HitCode[][];
  /** One entry per steel target. */
  steel: SteelHit[];
  noShoots: number;
  procedurals: number;
}

type TargetCounts = Pick<Stage, "paperTargets" | "steelTargets">;
type PenaltyLimits = Pick<Stage, "paperTargets" | "steelTargets" | "noShootTargets" | "hitsPerPaperTarget">;

export function emptyDraft(stage: TargetCounts): ScoreDraft {
  return {
    timeDigits: "",
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
    timeDigits: digitsFromSeconds(score.timeSec),
    // A row never holds more hits than the stage asks for: keep the most recent ones.
    paper: draft.paper.map((_, i) => (score.paper[i] ?? []).slice(-stage.hitsPerPaperTarget)),
    steel: draft.steel.map((_, i) => score.steel[i] ?? null),
    noShoots: Math.min(score.noShoots, maxNoShoots(stage.noShootTargets)),
    procedurals: Math.min(
      score.procedurals,
      maxProcedurals(stage.paperTargets, stage.steelTargets, stage.hitsPerPaperTarget),
    ),
  };
}

const replaceAt = <T>(items: T[], index: number, value: T): T[] => items.map((item, i) => (i === index ? value : item));

/** Tap a paper cell. `hitsPerPaperTarget` is the stage's setting: a row keeps that many recent hits. */
export function tapPaper(draft: ScoreDraft, row: number, hit: HitCode, hitsPerPaperTarget: number): ScoreDraft {
  if (row < 0 || row >= draft.paper.length) return draft;
  return { ...draft, paper: replaceAt(draft.paper, row, addPaperHit(draft.paper[row], hit, hitsPerPaperTarget)) };
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
  return {
    ...draft,
    procedurals: clamp(value, maxProcedurals(stage.paperTargets, stage.steelTargets, stage.hitsPerPaperTarget)),
  };
}

// --- Time entry: digits typed on the keypad, two implied decimals -------------------------------

export const MAX_TIME_DIGITS = 5;

const stripLeadingZeros = (digits: string) => digits.replace(/^0+/, "");

/** Add a digit (0-9) on the right. Ignored when it is not a digit or the time is already 5 digits long. */
export function appendTimeDigit(draft: ScoreDraft, digit: string): ScoreDraft {
  if (!/^[0-9]$/.test(digit) || draft.timeDigits.length >= MAX_TIME_DIGITS) return draft;
  return { ...draft, timeDigits: stripLeadingZeros(draft.timeDigits + digit) };
}

/** Remove the last digit. */
export function backspaceTimeDigit(draft: ScoreDraft): ScoreDraft {
  return { ...draft, timeDigits: draft.timeDigits.slice(0, -1) };
}

/** Remove the whole time (the keypad's clear key). */
export function clearTimeDigits(draft: ScoreDraft): ScoreDraft {
  return { ...draft, timeDigits: "" };
}

/** Seconds from the typed digits ("842" -> 8.42), or null when no time has been entered. */
export function secondsFromDigits(digits: string): number | null {
  return digits === "" ? null : Number(digits) / 100;
}

/** The digits for a saved time (8.42 -> "842"); null gives "". */
export function digitsFromSeconds(seconds: number | null): string {
  if (seconds === null) return "";
  return stripLeadingZeros(String(Math.min(Math.round(seconds * 100), 10 ** MAX_TIME_DIGITS - 1)));
}

/** Display text with two decimals: "842" -> "8.42", "5" -> "0.05", "" -> "" (nothing entered). */
export function formatTimeDigits(digits: string): string {
  if (digits === "") return "";
  const padded = digits.padStart(3, "0");
  return `${padded.slice(0, -2)}.${padded.slice(-2)}`;
}

/** True when two drafts hold exactly the same entry (used to tell whether leaving would lose anything). */
export function isSameDraft(a: ScoreDraft, b: ScoreDraft): boolean {
  return (
    a.timeDigits === b.timeDigits &&
    a.noShoots === b.noShoots &&
    a.procedurals === b.procedurals &&
    a.steel.length === b.steel.length &&
    a.steel.every((hit, i) => hit === b.steel[i]) &&
    a.paper.length === b.paper.length &&
    a.paper.every((row, i) => row.length === b.paper[i].length && row.every((hit, j) => hit === b.paper[i][j]))
  );
}

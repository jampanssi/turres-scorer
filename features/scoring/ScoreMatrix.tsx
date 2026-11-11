"use client";

import { useT } from "@/shared/i18n/useT";
import { Card } from "@/shared/ui/Card";
import { cx } from "@/shared/ui/cx";
import { IconButton } from "@/shared/ui/IconButton";
import { UndoIcon } from "@/shared/ui/icons";
import type { HitCode, SteelHit } from "@/shared/domain/types";
import { paperRemaining, steelRemaining } from "./entry";

const GRID = "grid grid-cols-[38px_1fr_1fr_1fr_1fr_44px] items-center gap-1";
const PAPER_CODES: HitCode[] = ["A", "C", "D", "M"];

interface ScoreMatrixProps {
  paper: HitCode[][];
  /** Hits each paper target needs on this stage (1-3): drives the "N left" tiles. */
  hitsPerPaperTarget: number;
  steel: SteelHit[];
  onPaperTap: (row: number, hit: HitCode) => void;
  onPaperUndo: (row: number) => void;
  onSteelTap: (row: number, hit: "A" | "M") => void;
  onSteelUndo: (row: number) => void;
}

/** The target matrix: paper rows (A C D M), then steel rows (A or M), each with a per-row undo. */
export function ScoreMatrix({
  paper,
  hitsPerPaperTarget,
  steel,
  onPaperTap,
  onPaperUndo,
  onSteelTap,
  onSteelUndo,
}: ScoreMatrixProps) {
  const { t } = useT();

  return (
    <Card as="section" className="flex flex-col gap-[9px] px-2 py-2.5">
      {paper.length > 0 && (
        <>
          <div className={GRID}>
            <span className="eyebrow">{t("score.paper")}</span>
            {PAPER_CODES.map((code) => (
              <ColumnHead key={code} code={code} />
            ))}
            <span />
          </div>
          {paper.map((hits, index) => {
            const row = index + 1;
            const remaining = paperRemaining(hits, hitsPerPaperTarget);
            return (
              <div key={row} className={GRID}>
                <RowLabel number={row} remaining={remaining} />
                {PAPER_CODES.map((code) => (
                  <Cell
                    key={code}
                    code={code}
                    count={hits.filter((h) => h === code).length}
                    label={t("score.paperCell", { row, code })}
                    onClick={() => onPaperTap(index, code)}
                  />
                ))}
                <UndoButton
                  label={t("score.undoPaper", { row })}
                  disabled={hits.length === 0}
                  onClick={() => onPaperUndo(index)}
                />
              </div>
            );
          })}
        </>
      )}

      {paper.length > 0 && steel.length > 0 && <hr className="my-1 border-divider" />}

      {steel.length > 0 && (
        <>
          {/* Steel has no column heads: just the section label, and the A and M cells always show their letter. */}
          <span className="eyebrow">{t("score.steel")}</span>
          {steel.map((hit, index) => {
            const row = index + 1;
            return (
              <div key={row} className={GRID}>
                <RowLabel number={row} remaining={steelRemaining(hit)} />
                <SteelCell
                  code="A"
                  selected={hit === "A"}
                  label={t("score.steelCell", { row, code: "A" })}
                  onClick={() => onSteelTap(index, "A")}
                />
                <div className="col-span-2 flex h-11 items-center justify-center text-[13px] text-text-secondary">
                  {t("score.steelHint")}
                </div>
                <SteelCell
                  code="M"
                  selected={hit === "M"}
                  label={t("score.steelCell", { row, code: "M" })}
                  onClick={() => onSteelTap(index, "M")}
                />
                <UndoButton
                  label={t("score.undoSteel", { row })}
                  disabled={hit === null}
                  onClick={() => onSteelUndo(index)}
                />
              </div>
            );
          })}
        </>
      )}
    </Card>
  );
}

function ColumnHead({ code }: { code: HitCode }) {
  return (
    <span
      className={cx(
        "text-center font-display text-[17px] font-bold",
        code === "M" ? "text-danger-fg" : "text-primary-text",
      )}
    >
      {code}
    </span>
  );
}

/** Row number tile: green when the row is complete, otherwise red-tinted with `N left`. */
function RowLabel({ number, remaining }: { number: number; remaining: number }) {
  const { t } = useT();
  const complete = remaining === 0;
  return (
    <div
      className={cx(
        "flex h-11 flex-col items-center justify-center rounded-cell leading-none",
        complete ? "bg-success text-white" : "bg-danger-tint text-danger-text",
      )}
    >
      <span className="font-display text-xl font-bold">{number}</span>
      {!complete && (
        <span className="mt-0.5 whitespace-nowrap text-[10px] font-bold tracking-tight">
          {t("score.left", { count: remaining })}
        </span>
      )}
    </div>
  );
}

/** One tap target. Empty: grey with no text. Filled: blue (A/C/D) or red (M) with the hit count. */
function Cell({ code, count, label, onClick }: { code: HitCode; count: number; label: string; onClick: () => void }) {
  const filled = count > 0;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cx(
        "flex h-11 items-center justify-center rounded-cell font-display text-[22px] font-bold transition-transform active:scale-95",
        filled
          ? cx("text-white", code === "M" ? "bg-danger" : "bg-primary")
          : "border-[1.5px] border-border-light bg-surface-muted",
      )}
    >
      {filled ? count : ""}
    </button>
  );
}

/**
 * A steel cell (A or M, mutually exclusive). It always shows its letter: not selected, a light cell with a
 * blue A or red M; selected, a solid blue or red fill with a white letter and no visible border.
 */
function SteelCell({
  code,
  selected,
  label,
  onClick,
}: {
  code: "A" | "M";
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        "flex h-11 items-center justify-center rounded-cell border-[1.5px] font-display text-[22px] font-bold transition-transform active:scale-95",
        selected
          ? cx("border-transparent text-white", code === "M" ? "bg-danger" : "bg-primary")
          : cx("border-border-light bg-surface-muted", code === "M" ? "text-danger-fg" : "text-primary-text"),
      )}
    >
      {code}
    </button>
  );
}

function UndoButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <IconButton variant="plain" shape="round" label={label} disabled={disabled} onClick={onClick}>
      <UndoIcon width={22} height={22} strokeWidth={2.2} />
    </IconButton>
  );
}

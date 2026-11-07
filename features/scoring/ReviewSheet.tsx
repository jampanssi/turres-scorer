"use client";

import { type ReactNode, useId, useState } from "react";
import { formatHitFactor, formatTime } from "@/shared/i18n/format";
import { useT } from "@/shared/i18n/useT";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Button } from "@/shared/ui/Button";
import { cx } from "@/shared/ui/cx";
import type { ScoreDraft } from "./draft";
import { paperRemaining, steelRemaining } from "./entry";
import type { ReviewSummary } from "./review";
import type { Totals } from "./rules";

const CODES: Array<keyof Totals> = ["A", "C", "D", "M", "NS", "PE"];
const PENALTY_CODES = new Set<keyof Totals>(["M", "NS", "PE"]);

interface ReviewSheetProps {
  /** The shooter line under the title: "Antti Mäkelä · #23 · Stage 3 · Squad 2". */
  subtitle: string;
  draft: ScoreDraft;
  hitsPerPaperTarget: number;
  summary: ReviewSummary;
  /** Edit: close the sheet and go back to scoring. */
  onEdit: () => void;
  /** Accept & save: called once the shooter has accepted. */
  onAccept: () => void;
  saving: boolean;
  saveFailed: boolean;
}

/**
 * Shows the entered score before it is saved: time, points and hit factor, hit totals, the hits per
 * target, and the shooter's sign-off. Render it only while open: the checkbox starts unticked each time.
 */
export function ReviewSheet({
  subtitle,
  draft,
  hitsPerPaperTarget,
  summary,
  onEdit,
  onAccept,
  saving,
  saveFailed,
}: ReviewSheetProps) {
  const { t } = useT();
  const checkboxId = useId();
  const [accepted, setAccepted] = useState(false);
  const canSave = accepted && summary.complete && !saving;

  return (
    <BottomSheet
      open
      onClose={() => !saving && onEdit()}
      title={t("review.title")}
      subtitle={subtitle}
      actions={
        <>
          <Button variant="outlinePrimary" disabled={saving} onClick={onEdit}>
            {t("review.edit")}
          </Button>
          <Button className="flex-1" disabled={!canSave} onClick={onAccept}>
            {saving ? t("common.saving") : t("review.save")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-3 gap-2 rounded-card bg-primary px-3.5 py-3 text-white">
          <Figure label={t("review.time")} value={summary.seconds === null ? "—" : formatTime(summary.seconds)} />
          <Figure label={t("review.points")} value={String(summary.points)} />
          <Figure label={t("review.hf")} value={formatHitFactor(summary.hitFactor)} accent />
        </div>

        <Card title={t("review.hitTotals")}>
          <div className="grid grid-cols-6 gap-1.5 text-center">
            {CODES.map((code) => (
              <div key={code} className="flex flex-col gap-0.5 rounded-input bg-surface-muted px-0.5 py-1.5">
                <span
                  className={cx(
                    "font-display text-[15px] font-bold",
                    PENALTY_CODES.has(code) ? "text-danger-fg" : "text-primary-text",
                  )}
                >
                  {code}
                </span>
                <span className="text-[17px] font-bold">{summary.totals[code]}</span>
                <span className="text-[11px] text-text-secondary">{summary.codePoints[code]}p</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t("review.targets")}>
          <div className="flex flex-col gap-2">
            {draft.paper.length > 0 && (
              <TargetRow label={t("score.paper")}>
                {draft.paper.map((hits, index) => (
                  <TargetTile
                    key={index}
                    number={index + 1}
                    text={hits.join("")}
                    warn={hits.includes("M") || paperRemaining(hits, hitsPerPaperTarget) > 0}
                  />
                ))}
              </TargetRow>
            )}
            {draft.steel.length > 0 && (
              <TargetRow label={t("score.steel")}>
                {draft.steel.map((hit, index) => (
                  <TargetTile
                    key={index}
                    number={index + 1}
                    text={hit ?? ""}
                    warn={hit === "M" || steelRemaining(hit) > 0}
                  />
                ))}
              </TargetRow>
            )}
          </div>
        </Card>

        <Card title={t("review.signOff")}>
          <label htmlFor={checkboxId} className="flex min-h-11 items-center gap-2.5 text-sm">
            <input
              id={checkboxId}
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="size-[22px] shrink-0 accent-primary"
            />
            {t("review.accept")}
          </label>
        </Card>

        {(summary.missingTime || summary.incompleteTargets > 0 || saveFailed) && (
          <div
            role="alert"
            className="flex flex-col gap-1 rounded-input bg-danger-tint px-3 py-2 text-sm font-semibold text-danger-text"
          >
            {summary.missingTime && <p>{t("review.issue.missingTime")}</p>}
            {summary.incompleteTargets > 0 && (
              <p>{t("review.issue.incompleteTargets", { count: summary.incompleteTargets })}</p>
            )}
            {saveFailed && <p>{t("common.saveError")}</p>}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

function Figure({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-on-primary-muted">{label}</span>
      <span className={cx("font-display text-[28px] font-bold leading-none", accent && "text-on-primary-accent")}>
        {value}
      </span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-card bg-surface px-3 py-2.5">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-text-label">{title}</h3>
      {children}
    </section>
  );
}

function TargetRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-12 shrink-0 pt-2 text-xs font-semibold text-text-secondary">{label}</span>
      <div className="grid flex-1 grid-cols-6 gap-1">{children}</div>
    </div>
  );
}

/** One target: its number and the hits. Misses and targets that are not complete stand out in red. */
function TargetTile({ number, text, warn }: { number: number; text: string; warn: boolean }) {
  return (
    <div
      className={cx(
        "flex flex-col items-center gap-0.5 rounded-cell py-1",
        warn ? "bg-danger-tint text-danger-text" : "bg-surface-muted text-primary-text",
      )}
    >
      <span className={cx("text-[11px]", warn ? "text-danger-text" : "text-text-secondary")}>{number}</span>
      <span className="font-display text-[17px] font-bold leading-none">{text || "—"}</span>
    </div>
  );
}

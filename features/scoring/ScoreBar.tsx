"use client";

import { useT } from "@/shared/i18n/useT";
import { Button } from "@/shared/ui/Button";
import { Stepper } from "@/shared/ui/Stepper";

interface ScoreBarProps {
  noShoots: number;
  maxNoShoots: number;
  onNoShootsChange: (value: number) => void;
  procedurals: number;
  maxProcedurals: number;
  onProceduralsChange: (value: number) => void;
  onDq: () => void;
  onDnf: () => void;
  onReview: () => void;
}

/** Sticky bottom bar: penalty steppers, then DQ · DNF · Review. It never scrolls away. */
export function ScoreBar(props: ScoreBarProps) {
  const { t } = useT();

  return (
    <div className="sticky bottom-0 z-10 flex flex-col gap-4 border-t border-border-light bg-surface px-4 pb-4 pt-3 shadow-bar">
      <div className="flex flex-col gap-[9px]">
        {props.maxNoShoots > 0 && (
          <Stepper
            label={t("score.noShoot")}
            value={props.noShoots}
            max={props.maxNoShoots}
            onChange={props.onNoShootsChange}
          />
        )}
        <Stepper
          label={t("score.procedural")}
          value={props.procedurals}
          max={props.maxProcedurals}
          onChange={props.onProceduralsChange}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="dangerOutline" className="px-4" onClick={props.onDq}>
          {t("score.dq")}
        </Button>
        <Button variant="outline" className="px-4" onClick={props.onDnf}>
          {t("score.dnf")}
        </Button>
        <Button className="flex-1" onClick={props.onReview}>
          {t("score.review")}
        </Button>
      </div>
    </div>
  );
}

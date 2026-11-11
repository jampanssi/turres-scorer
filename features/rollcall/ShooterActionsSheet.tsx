"use client";

import { useState } from "react";
import { getRepository } from "@/shared/data";
import { useT } from "@/shared/i18n/useT";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Button } from "@/shared/ui/Button";
import { cx } from "@/shared/ui/cx";
import { CheckIcon, SwapIcon, UndoIcon, UserOffIcon } from "@/shared/ui/icons";
import { showToast } from "@/shared/ui/toast";
import type { ShooterRowData } from "./summary";

/** A plain list like the Facebook and Slack menus: a leading icon, the label, hairlines between rows. */
const listClass = "divide-y divide-border-light border-y border-border-light";
const rowClass =
  "relative flex min-h-[56px] w-full items-center gap-4 px-1 py-2 text-left text-base font-semibold text-text disabled:opacity-50";

interface ShooterActionsSheetProps {
  row: ShooterRowData;
  /** The shooter's current squad (shown under the name). */
  squad: { id: string; number: number };
  /** The other squads of the match, for "Change squad". */
  otherSquads: ReadonlyArray<{ id: string; number: number; shooters: number }>;
  /** The signed-in range officer, recorded on the move. */
  roId: string;
  /** Mark (true) or unmark (false) DNS; saved by the screen, which shows it at once. */
  onSetDns: (dns: boolean) => void;
  onClose: () => void;
}

/**
 * The actions of one shooter, in a bottom sheet opened by tapping the shooter on the Shooters tab:
 * - **Change squad**: choose another squad of the match; the shooter moves there for the whole match, to the
 *   end of its order.
 * - **Mark as DNS** / **Take DNS back**: saved at once, the same record the Shooters tab writes.
 * A shooter with a result on any stage (scored, DNF or DQ) can do neither: both rows are disabled with a note
 * (an existing DNS mark can still be taken back).
 * Render it only while open: it starts on the action list each time.
 */
export function ShooterActionsSheet({ row, squad, otherSquads, roId, onSetDns, onClose }: ShooterActionsSheetProps) {
  const { t } = useT();
  const { shooter } = row;
  const [step, setStep] = useState<"actions" | "move">("actions");
  const [target, setTarget] = useState(otherSquads[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  // With a result on any stage a shooter stays in their squad and cannot be marked DNS; a DNS mark can still be taken back.
  const locked = row.hasResults || row.disqualified;
  const canMove = !locked;
  const canToggleDns = !locked || row.dns;

  /** Run a change; on success close the sheet, on failure keep it open with an error. */
  async function run(change: () => Promise<void>) {
    setSaving(true);
    setFailed(false);
    try {
      await change();
      onClose();
    } catch {
      setFailed(true);
      setSaving(false);
    }
  }

  function toggleDns() {
    const dns = !row.dns;
    onSetDns(dns);
    showToast({
      title: t("toast.dnsTitle"),
      message: t(dns ? "toast.dnsOn" : "toast.dnsOff", { name: shooter.name }),
    });
    onClose();
  }

  const moveShooter = () =>
    run(async () => {
      const destination = otherSquads.find((s) => s.id === target);
      if (!destination) return;
      const repo = await getRepository();
      await repo.moveShooter(shooter.id, destination.id, { roId });
      showToast({
        title: t("toast.movedTitle"),
        message: t("toast.moved", { name: shooter.name, number: destination.number }),
      });
    });

  return (
    <BottomSheet
      open
      tone="surface"
      icon={<Initials name={shooter.name} />}
      onClose={() => !saving && onClose()}
      title={shooter.name}
      subtitle={`#${shooter.competitorNumber} · ${t("common.squad", { number: squad.number })}`}
      actions={
        step === "move" && (
          <Button className="w-full" disabled={saving || !target} onClick={moveShooter}>
            {saving ? t("common.saving") : t("shooters.move.confirm")}
          </Button>
        )
      }
    >
      {step === "actions" ? (
        <div className="flex flex-col gap-3 pb-3">
          <ul className={listClass}>
            <li>
              <button type="button" className={rowClass} disabled={saving || !canMove} onClick={() => setStep("move")}>
                <SwapIcon className="size-6 shrink-0 text-text-secondary" />
                <span>{t("shooters.actions.changeSquad")}</span>
              </button>
            </li>
            <li>
              <button type="button" className={rowClass} disabled={!canToggleDns} onClick={toggleDns}>
                {row.dns ? (
                  <UndoIcon className="size-6 shrink-0 text-text-secondary" />
                ) : (
                  <UserOffIcon className="size-6 shrink-0 text-text-secondary" />
                )}
                <span>{t(row.dns ? "shooters.actions.undoDns" : "shooters.actions.markDns")}</span>
              </button>
            </li>
          </ul>
          {!canMove && <p className="px-1 text-sm text-text-secondary">{t("shooters.actions.hasResultsNote")}</p>}
          {failed && <SaveError />}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="px-1 text-sm text-text-secondary">{t("shooters.move.info", { name: shooter.name })}</p>
          {otherSquads.length === 0 ? (
            <p className="px-1 text-text-secondary">{t("shooters.move.none")}</p>
          ) : (
            <fieldset disabled={saving}>
              <legend className="eyebrow mb-2 px-1">{t("shooters.move.legend")}</legend>
              <ul className={listClass}>
                {otherSquads.map((s) => (
                  <li key={s.id}>
                    <label className={cx(rowClass, "cursor-pointer")}>
                      <input
                        type="radio"
                        name="move-to-squad"
                        value={s.id}
                        checked={target === s.id}
                        onChange={() => setTarget(s.id)}
                        className="peer sr-only"
                      />
                      <span className="flex flex-col">
                        <span>{t("common.squad", { number: s.number })}</span>
                        <span className="text-[13px] font-normal text-text-secondary">
                          {t("common.shooterCount", { count: s.shooters })}
                        </span>
                      </span>
                      <CheckIcon
                        aria-hidden="true"
                        className={cx("ml-auto size-6 shrink-0 text-primary-text", target !== s.id && "invisible")}
                      />
                      <span className="pointer-events-none absolute inset-0 rounded-[inherit] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[-2px] peer-focus-visible:outline-primary" />
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
          {failed && <SaveError />}
        </div>
      )}
    </BottomSheet>
  );
}

function SaveError() {
  const { t } = useT();
  return (
    <p role="alert" className="rounded-input bg-danger-tint px-3 py-2 text-sm font-semibold text-danger-text">
      {t("common.saveError")}
    </p>
  );
}

/** The shooter's initials in a circle, like the avatar in the Facebook share menu. */
function Initials({ name }: { name: string }) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-hidden="true"
      className="flex size-11 items-center justify-center rounded-full bg-primary-tint font-display text-lg font-bold uppercase text-primary-text"
    >
      {letters}
    </span>
  );
}

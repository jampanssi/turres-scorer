"use client";

import { type ReactNode, type RefObject, useEffect, useRef, useState } from "react";
import { cx } from "./cx";

/** What the trigger button must receive: spread it onto the button. */
export interface PopoverTriggerProps {
  ref: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  "aria-haspopup": "dialog";
  "aria-expanded": boolean;
}

interface PopoverProps {
  /** Renders the button that opens the popover, using the props it is given. */
  trigger: (props: PopoverTriggerProps) => ReactNode;
  /** Accessible name of the panel. */
  label: string;
  /** Look of the panel (width, background, radius ...). Placement under the trigger is built in. */
  panelClassName?: string;
  children: ReactNode;
}

/**
 * A panel that opens under a button, aligned to its right edge (the header user menu). It closes on
 * Escape (and puts focus back on the button), and on a tap anywhere outside it. Unlike a sheet it is not
 * modal: the page stays usable, and Tab moves on into the panel because it follows the button in the page.
 */
export function Popover({ trigger, label, panelClassName, children }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {trigger({
        ref: triggerRef,
        onClick: () => setOpen((value) => !value),
        "aria-haspopup": "dialog",
        "aria-expanded": open,
      })}
      {open && (
        <div role="dialog" aria-label={label} className={cx("absolute right-0 top-full z-40 mt-2", panelClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}

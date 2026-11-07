"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";

interface DialogProps {
  open: boolean;
  /**
   * The user dismissed the dialog (Escape, or a tap outside the content). The caller decides whether to
   * close it, for example not while a save is running, by changing `open`.
   */
  onDismiss: () => void;
  /** Id of the element that names the dialog. */
  labelledBy: string;
  /** The content. Position it yourself; the area around it is the tap-outside area. */
  children: ReactNode;
}

/**
 * A modal dialog on the browser's native `<dialog>`: the rest of the page becomes inert, Tab stays inside,
 * Escape asks to close, and focus returns to what opened it. The dialog fills the screen (transparent)
 * over a dimmed backdrop and lays its content out at the bottom, so a tap on the empty area is a tap outside.
 * The page behind is kept from scrolling by `body:has(dialog[open])` in globals.css.
 */
export function Dialog({ open, onDismiss, labelledBy, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal(); // remembers the focused button, to give focus back on close
      // Focus the dialog itself, not its first control: screen readers announce the dialog, Tab goes
      // on to the first control, and no field is highlighted just because the sheet appeared.
      dialog.focus({ preventScroll: true });
    }
    if (!open && dialog.open) dialog.close();
    // Unmounting while open (a sheet that is only rendered while shown): close it first so that
    // focus goes back to the button that opened it.
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault(); // Escape: let the caller decide, instead of the browser closing it behind React's back
        onDismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-text outline-none backdrop:bg-scrim open:flex open:items-end open:justify-center"
    >
      {children}
    </dialog>
  );
}

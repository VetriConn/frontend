"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * The modal focus contract EditDialog established, as a hook, so every
 * dialog and drawer gets the same behaviour instead of its own subset:
 *
 * - focus moves into the dialog on open and back to the trigger on close
 * - Tab cycles inside the dialog (document-level, so focus can't escape
 *   into the page behind an aria-modal surface)
 * - Escape closes, unless `closeDisabled` (mid-submit, say)
 * - body scroll is locked while open
 *
 * Attach the returned ref to the dialog panel. Works whether the caller
 * hides via `isOpen` prop or unmounts entirely — cleanup restores focus.
 */
export function useModalFocus(
  isOpen: boolean,
  onClose: () => void,
  options: { closeDisabled?: boolean } = {},
): React.RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement>(null);

  // Latest-value refs keep the effect keyed on isOpen alone: re-running it
  // on every onClose identity change would re-fire initial focus mid-use.
  //
  // Written in an effect rather than during render. A render can be started
  // and thrown away, and a ref written on the discarded attempt keeps the
  // value from a render that never committed. Both refs are only ever read
  // from event handlers, which run after commit, so there is nothing to
  // gain from writing them earlier.
  const closeRef = useRef(onClose);
  const closeDisabledRef = useRef(!!options.closeDisabled);
  useEffect(() => {
    closeRef.current = onClose;
    closeDisabledRef.current = !!options.closeDisabled;
  });

  useEffect(() => {
    if (!isOpen) return;

    const previousActive = document.activeElement as HTMLElement | null;

    const getFocusable = (): HTMLElement[] =>
      containerRef.current
        ? (Array.from(
            containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR),
          ) as HTMLElement[])
        : [];

    // Deferred so the dialog's contents exist before we focus them.
    const initialFocus = setTimeout(() => {
      getFocusable()[0]?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!closeDisabledRef.current) {
          e.stopPropagation();
          closeRef.current();
        }
        return;
      }

      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Focus outside the dialog (or about to leave it) gets pulled back in.
      if (!containerRef.current?.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(initialFocus);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActive?.focus?.();
    };
  }, [isOpen]);

  return containerRef;
}

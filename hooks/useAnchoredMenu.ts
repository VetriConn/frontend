"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

/**
 * Position a menu against its trigger, outside every clipping ancestor.
 *
 * This bug has now been reported three times in three places, and it is
 * always the same one: a menu positioned `absolute` inside a container with
 * `overflow` set gets clipped at that container's edge, with no way to
 * scroll the rest into view. The containers are all reasonable — a table
 * wrapper with `overflow-x-auto`, a card with `overflow-hidden`, a dialog
 * that sets `document.body.style.overflow = "hidden"` while it is open.
 *
 * Two things together fix it, and neither is enough alone:
 *
 *  - a PORTAL to <body>, so no ancestor of the trigger can clip it;
 *  - `position: fixed`, so the body itself cannot either — which is the part
 *    that catches people out, because a portal into a body that a dialog has
 *    set to `overflow: hidden` is still inside a clipping box.
 *
 * Coordinates are therefore viewport-relative: no scrollY/scrollX. The
 * listener uses capture so a scroll inside any nested container repositions
 * it too, not only a scroll of the page.
 */

export interface AnchorCoords {
  top: number;
  left: number;
  width: number;
}

export interface AnchoredMenu {
  coords: AnchorCoords;
  /** Recompute now — after the menu's own size changes, say. */
  reposition: () => void;
}

/**
 * @param triggerRef The element to anchor to. Taken as a parameter rather
 * than created here, because every caller already has one for focus
 * management and two refs on one element is a bug waiting to happen.
 */
export function useAnchoredMenu<T extends HTMLElement>(
  open: boolean,
  triggerRef: React.RefObject<T | null>,
  options: {
    /** Gap between the trigger and the menu, in pixels. */
    offset?: number;
    /** Right-align the menu to the trigger instead of left. */
    align?: "left" | "right";
    /** Needed to right-align before the menu has been measured. */
    menuWidth?: number;
  } = {},
): AnchoredMenu {
  const { offset = 4, align = "left", menuWidth } = options;
  const [coords, setCoords] = useState<AnchorCoords>({
    top: 0,
    left: 0,
    width: 0,
  });

  const reposition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      // Viewport coordinates, to match position: fixed. Adding scrollY here
      // is the classic mistake — it lands the menu a page-length away the
      // moment anything is scrolled.
      top: rect.bottom + offset,
      left:
        align === "right"
          ? rect.right - (menuWidth ?? rect.width)
          : rect.left,
      width: rect.width,
    });
  }, [triggerRef, offset, align, menuWidth]);

  // Before paint, so the menu never appears at 0,0 first.
  useLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    // Capture: a scroll inside a nested container does not bubble, and those
    // containers are exactly the ones this exists to escape.
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  return { coords, reposition };
}

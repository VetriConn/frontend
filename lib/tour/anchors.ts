/**
 * Finding the element a tour step points at.
 *
 * Every nav entry is rendered twice, once in the desktop bar and once in the
 * drawer, and both copies carry the same `data-tour` id. Which one exists on
 * screen depends on a breakpoint that moves: `DashboardNavbar` switches from
 * `lg` to `xl` whenever the accessibility text setting is not "normal".
 *
 * This module never asks what the breakpoint is. It asks the DOM which copy is
 * actually being painted. That is deliberately ignorant, and it is why this
 * keeps working when the thresholds change again, and why it needs no
 * knowledge of `useAccessibility` despite the layout depending on it.
 *
 * The reason it cannot just read a media query: `rem` inside a media query
 * resolves against the browser's initial 16px and ignores the scaled root font
 * size, so a `min-width: 64rem` query fires at exactly 1024px no matter what
 * the user picked. The navbar decides in JavaScript for that reason, and so
 * does this.
 */

/** The id used to reach the drawer's open/close button. */
export const MENU_TOGGLE_ID = "nav-menu-toggle";

/**
 * Wait one paint, or 50ms, whichever comes first.
 *
 * `requestAnimationFrame` does not fire while the tab is hidden, and a bare
 * `await` on it therefore never resolves. That is not theoretical: opening
 * the dashboard in a background tab is ordinary behaviour, and it left the
 * tour hung halfway through resolving its steps with the nav drawer stuck
 * open and no tour on screen.
 *
 * The frame is still what we want when the page is visible, because the
 * point is to measure after layout has settled. The timer is only there so
 * a hidden tab degrades instead of deadlocking.
 */
const nextFrame = (): Promise<void> =>
  new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    requestAnimationFrame(finish);
    setTimeout(finish, 50);
  });

/**
 * Is this element actually being painted?
 *
 * `getClientRects()` is empty for `display: none`, for a zero-size box, and
 * for anything inside a collapsed ancestor, which covers every way the two
 * layouts hide each other. `offsetParent` would miss `position: fixed`
 * elements, and reading computed styles would mean walking ancestors by hand.
 */
export function isVisible(el: Element): boolean {
  return el.getClientRects().length > 0;
}

/** The visible copy of `id`, or null when none is on screen. */
export function findVisible(id: string): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`);
  for (const el of all) if (isVisible(el)) return el;
  return null;
}

/** Is the nav currently in its drawer layout? */
export function isDrawerLayout(): boolean {
  return !!findVisible(MENU_TOGGLE_ID);
}

/** Is the drawer open right now? */
export function isDrawerOpen(): boolean {
  return (
    findVisible(MENU_TOGGLE_ID)?.getAttribute("aria-expanded") === "true"
  );
}

/**
 * Resolve an anchor to the copy currently on screen.
 *
 * Passive on purpose. An earlier version clicked the drawer open itself, and
 * that click was the piece fighting the drawer's own state: the provider then
 * closed the drawer after resolving, which hid every anchor it had just
 * found. The tour now asks the user to open the menu, as its own step, and
 * this function simply reports what it can see.
 *
 * Returns null rather than throwing when nothing is reachable, so the caller
 * drops the step. An account without a company genuinely has no
 * `nav-companies` element, and that is not an error.
 */
export async function resolveAnchor(id: string): Promise<HTMLElement | null> {
  const direct = findVisible(id);
  if (direct) return direct;

  // Hidden but present means it is inside the closed drawer. Give the layout
  // a frame in case it is mid-transition, then look once more.
  if (!document.querySelector(`[data-tour="${id}"]`)) return null;
  await nextFrame();
  return findVisible(id);
}

/**
 * Does this id exist at all, visible or not?
 *
 * Step resolution uses this rather than visibility, because on a drawer
 * layout every nav anchor is hidden at start time and dropping them all
 * would leave a one-step tour.
 */
export function anchorExists(id: string): boolean {
  return !!document.querySelector(`[data-tour="${id}"]`);
}

/**
 * Close the drawer, used only when the tour ends.
 *
 * Not called between steps. Closing it mid-tour is what hid every anchor the
 * resolver had just found.
 */
export function closeDrawerIfOpen(): void {
  const toggle = findVisible(MENU_TOGGLE_ID);
  if (toggle?.getAttribute("aria-expanded") === "true") toggle.click();
}

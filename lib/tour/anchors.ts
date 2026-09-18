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

/**
 * Resolve an anchor, opening the drawer if that is where it is hiding.
 *
 * Returns null rather than throwing when the anchor cannot be reached, so the
 * caller drops the step instead of pointing at nothing. An account without a
 * company genuinely has no `nav-companies` element, and that is not an error.
 */
export async function resolveAnchor(id: string): Promise<HTMLElement | null> {
  const direct = findVisible(id);
  if (direct) return direct;

  // Not painted anywhere. Either it does not exist for this account, or it is
  // inside the closed drawer. Distinguish by asking whether it exists at all.
  const existsHidden = document.querySelector(`[data-tour="${id}"]`);
  if (!existsHidden) return null;

  const toggle = findVisible(MENU_TOGGLE_ID);
  if (!toggle) return null;

  // Clicking the real control rather than reaching into the navbar's state.
  // The drawer's open flag is local to a 780-line component, and the click is
  // the same action a person takes, so it keeps focus handling, the body
  // scroll lock and the aria-expanded bookkeeping all correct for free.
  if (toggle.getAttribute("aria-expanded") !== "true") {
    toggle.click();
    await nextFrame();
    await nextFrame();
  }

  return findVisible(id);
}

/** Close the drawer if this module opened it. */
export function closeDrawerIfOpen(): void {
  const toggle = findVisible(MENU_TOGGLE_ID);
  if (toggle?.getAttribute("aria-expanded") === "true") toggle.click();
}

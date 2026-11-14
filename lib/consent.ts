/**
 * Whether this visitor has agreed to analytics.
 *
 * Scope is narrow on purpose. The only non-essential storage this product
 * has is the traffic beacon and its once-per-session marker, so there is one
 * decision to make rather than a category matrix nobody reads. Sign-in
 * cookies are strictly necessary — they exist only because the visitor asked
 * to sign in — and are not covered here.
 *
 * Opt-in, not opt-out: unanswered means no. Quebec's Law 25 s.8.1 governs
 * technology with identifying or profiling functions, and the secondary
 * guidance disagrees about how far it reaches analytics, so the design takes
 * the reading that is defensible under either. The cost of being wrong in
 * this direction is some missing early data; the other direction collects
 * from people who never agreed.
 *
 * Stored in localStorage rather than a cookie. A cookie-consent record kept
 * in a cookie is not the joke it sounds like — the record is itself strictly
 * necessary — but localStorage is never sent to the server, which keeps the
 * decision on the visitor's device and out of every request.
 */
const CONSENT_KEY = "vc:analytics-consent";

export type ConsentChoice = "granted" | "denied";

/** What the visitor has decided, or null if they have not been asked yet. */
export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    // Private mode or storage disabled. Treated as "not asked", and because
    // the default is off, that means nothing is collected.
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // If the decision cannot be stored it cannot be remembered, so the
    // banner returns next visit. Annoying, and the honest failure: the
    // alternative is treating an unstorable "denied" as a yes.
  }
  // Let anything already mounted react without a reload — the beacon fires
  // on acceptance rather than waiting for the next page view.
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}

/** Fired on this window when the visitor decides. */
export const CONSENT_EVENT = "vc:consent-change";

/** True only on an explicit yes. Unanswered and unreadable both mean no. */
export function analyticsAllowed(): boolean {
  return readConsent() === "granted";
}

/**
 * A remembered "was signed in" flag, used only to paint the header's CTA
 * correctly on first load instead of waiting for /auth/profile to answer.
 *
 * This is a rendering hint, never an authorisation signal: routes are guarded
 * on the server, and the real profile response overwrites it the moment it
 * lands. Kept beside the logout call so signing out cannot leave a stale
 * "Dashboard" label behind.
 */
export const AUTH_HINT_KEY = "vc:signed-in";

export function setAuthHint(signedIn: boolean): void {
  try {
    window.localStorage.setItem(AUTH_HINT_KEY, signedIn ? "1" : "0");
  } catch {
    // Private mode or storage disabled — the hint is optional by design.
  }
}

export function readAuthHint(): boolean | null {
  try {
    const stored = window.localStorage.getItem(AUTH_HINT_KEY);
    return stored === null ? null : stored === "1";
  } catch {
    return null;
  }
}

/**
 * Return-URL handling for the auth pages.
 *
 * Company invites arrive by email and land on a page that requires a session,
 * so an invited person often has to sign in — or sign up entirely — before the
 * invite can be accepted. These helpers carry the intended destination through
 * that detour.
 *
 * Only same-origin relative paths are ever honored. A `redirect` value is
 * attacker-supplied by definition (it arrives in a URL that can be emailed to
 * anyone), so anything that could leave the site is discarded rather than
 * corrected — an open redirect on a signin page is a credible phishing vector.
 */

export const RETURN_URL_PARAM = "redirect";

export const DEFAULT_POST_AUTH_PATH = "/dashboard";

/**
 * Reduce a raw `redirect` param to a safe in-app path, or null.
 *
 * Rejects absolute URLs (`https://evil.test`), scheme-relative URLs
 * (`//evil.test`), backslash variants that some browsers normalize into
 * scheme-relative (`/\evil.test`), and non-path values like `javascript:`.
 */
export function sanitizeReturnUrl(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;

  const value = raw.trim();
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.startsWith("/\\")) return null;

  return value;
}

/**
 * Append a return URL to an auth path, e.g.
 * `withReturnUrl("/signin", "/companies/invites/accept?token=abc")`.
 */
export function withReturnUrl(authPath: string, returnTo: string): string {
  const safe = sanitizeReturnUrl(returnTo);
  if (!safe) return authPath;

  const separator = authPath.includes("?") ? "&" : "?";
  return `${authPath}${separator}${RETURN_URL_PARAM}=${encodeURIComponent(safe)}`;
}

/**
 * Resolve where to send someone after authenticating, given the raw param.
 * Falls back to the dashboard when absent or unsafe.
 */
export function resolvePostAuthPath(
  raw: string | null | undefined,
  fallback: string = DEFAULT_POST_AUTH_PATH,
): string {
  return sanitizeReturnUrl(raw) ?? fallback;
}

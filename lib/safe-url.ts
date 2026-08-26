/**
 * URL-scheme guards for links whose value comes from users, employers, or the
 * scraper. React and `window.open` will happily render/execute a `javascript:`
 * (or `data:` / `vbscript:`) href, so any attacker-controlled string placed in
 * an `href`/`window.open` is a click-XSS unless the scheme is checked. These
 * helpers return the URL only when it uses a safe, navigable scheme, else
 * `undefined` (so the caller drops the href / hides the link).
 */

/** http(s) only — for website, attachment, and document links. */
export function safeHttpUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : undefined;
}

/**
 * http(s) or mailto — for "apply" destinations, which may legitimately be an
 * email address. Still blocks javascript:/data:/vbscript:.
 */
export function safeApplyUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  return /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : undefined;
}

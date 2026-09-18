/**
 * Formats a date string into a relative time (e.g., "2 hours ago", "Yesterday")
 * or a localized date string if older than a week.
 */
export function formatRelativeTime(value?: string | Date): string {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Formats a date string into a simple time string (e.g., "10:30 AM")
 */
export function formatTime(value?: string | Date): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Formats a date string into a full localized date and time.
 */
export function formatFullDateTime(value?: string | Date): string {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString();
}

/**
 * Formats a date into the site's standard readable form ("Sept 2, 2026").
 * Returns "-" for missing or invalid values.
 *
 * The locale is pinned so server and client render identically. This used to
 * emit the bare numeric locale form ("9/2/2026"), which is why a dozen
 * components grew their own copy — every one of them wanted this format.
 */
export function formatDate(value?: string | Date): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Month-and-year form for duration-style dates ("Sept 2026") — work
 * experience ranges and the like. Returns "" when absent or invalid, so
 * range-building call sites can compose without stray dashes.
 */
export function formatMonthYear(value?: string | Date): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

/**
 * A start and an end, as one readable span.
 *
 * Education and work history each had their own copy of this, identical down
 * to the four branches, differing only in that work history formats its
 * values through formatMonthYear first. Two copies of four branches is two
 * places to get "Present" wrong, and during a copy sweep both had to be
 * edited by hand to say "to" instead of an en dash.
 *
 * Takes already-formatted strings so the caller decides whether a value is a
 * bare year or a month and year.
 *
 * "to" rather than a dash on purpose: a dash between two values is read aloud
 * as nothing, so a screen reader announces "2019 2023".
 */
export function formatRange(start?: string, end?: string): string {
  if (!start && !end) return "";
  if (!start) return end ?? "";
  if (!end) return `${start} to Present`;
  return `${start} to ${end}`;
}

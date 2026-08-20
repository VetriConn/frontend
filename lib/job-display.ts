/**
 * Display helpers for job listings.
 *
 * These exist because the same two decisions — "where does applying actually
 * go?" and "what does this job pay?" — were previously made independently in
 * several components, and drifted. Aggregated (scraped) listings broke all of
 * them, so the rules live here and are unit-tested.
 */

import type { Job } from "@/types/job";

type SourceFields = Pick<
  Job,
  "source" | "source_name" | "external_url" | "applicationLink"
>;

type SalaryFields = Pick<Job, "salary" | "salary_range" | "salary_text">;

/**
 * True for listings scraped from an external board rather than posted by an
 * employer here. These have no employer behind them, so our own application
 * flow would save an application nobody ever receives.
 */
export function isAggregatedJob(job: Pick<Job, "source">): boolean {
  return job.source === "scraped";
}

/** Board a listing was aggregated from, for attribution. */
export function getSourceLabel(
  job: Pick<Job, "source" | "source_name">,
): string | null {
  if (!isAggregatedJob(job)) return null;
  return job.source_name?.trim() || "an external job board";
}

/**
 * Where an application should actually be sent, or null when it belongs in our
 * own flow.
 *
 * Covers both cases that route off-site: employer postings that opted into an
 * external process (`applicationLink`), and scraped listings whose real posting
 * lives at `external_url`.
 */
export function getExternalApplyUrl(job: SourceFields): string | null {
  return job.external_url?.trim() || job.applicationLink?.trim() || null;
}

/**
 * How a job states its pay.
 *
 * Job Bank quotes most roles hourly, and an hourly rate has no meaningful
 * annual figure to store — the scraper leaves `salary.number` at 0 and keeps
 * the source's wording in `salary_text`. That means **hourly roles are
 * invisible to any filter or sort over `salary.number`**: the backend's
 * `minSalary`/`maxSalary` filter and `sortBy=salary` both operate on that
 * field, so an hourly job matches a minimum of 0 and nothing else.
 *
 * Neither filter nor sort is currently exposed in the UI. Whoever wires them
 * up needs to decide what happens to hourly roles rather than letting them
 * silently disappear from results — most likely a separate pay-basis filter,
 * which needs a backend field to be correct across pagination.
 */
export type PayBasis = "hourly" | "annual" | "unspecified";

const HOURLY_PATTERN = /\b(hour|hourly|hr|per\s*hour)\b/i;
const PERIODIC_PATTERN = /\b(week|weekly|day|daily|month|monthly)\b/i;

/** Whether a job quotes pay hourly, annually, or not at all. */
export function getPayBasis(job: SalaryFields): PayBasis {
  const sourceText = job.salary_text?.trim();

  if (sourceText) {
    if (HOURLY_PATTERN.test(sourceText)) return "hourly";
    if (PERIODIC_PATTERN.test(sourceText)) return "unspecified";
    return /\d/.test(sourceText) ? "annual" : "unspecified";
  }

  if (job.salary?.number || job.salary_range?.start_salary?.number) {
    return "annual";
  }

  return "unspecified";
}

/**
 * True when a job carries a numeric annual salary, and so participates
 * correctly in salary filtering and sorting.
 */
export function hasComparableSalary(job: SalaryFields): boolean {
  return Boolean(
    job.salary?.number ||
      (job.salary_range?.start_salary?.number &&
        job.salary_range?.end_salary?.number),
  );
}

function formatCompact(symbol: string, amount: number): string {
  return `${symbol}${Math.round(amount / 1000)}K`;
}

function formatFull(symbol: string, amount: number, currency: string): string {
  return `${symbol}${amount.toLocaleString()}${currency ? ` ${currency}` : ""}`;
}

/**
 * The salary line for a job, or null when we genuinely don't know it.
 *
 * `salary_text` wins whenever it exists. Scraped listings carry the source's
 * own wording ("$18.50 hourly"), and the parsed numeric salary cannot represent
 * hourly pay — dividing 18.5 by 1000 and calling it "$0K/year" is worse than
 * saying nothing.
 *
 * A numeric salary of 0 is treated as unknown, not as free. The scraper writes
 * 0 whenever it cannot find a figure in the source text.
 */
export function formatJobSalary(
  job: SalaryFields,
  variant: "compact" | "full" = "compact",
): string | null {
  // Scraped listings bake the word in ("Salary $34.75 hourly"); every
  // surface renders it beside a dollar icon or label, so it read twice.
  const sourceText = job.salary_text?.trim().replace(/^salary\s*:?\s*/i, "");
  if (sourceText) return sourceText;

  const start = job.salary_range?.start_salary;
  const end = job.salary_range?.end_salary;
  if (start?.number && end?.number) {
    return variant === "compact"
      ? `${formatCompact(start.symbol, start.number)} – ${formatCompact(end.symbol, end.number)}/year`
      : `${formatFull(start.symbol, start.number, start.currency)} – ${formatFull(end.symbol, end.number, end.currency)}`;
  }

  if (job.salary?.number) {
    return variant === "compact"
      ? `${formatCompact(job.salary.symbol, job.salary.number)}/year`
      : formatFull(job.salary.symbol, job.salary.number, job.salary.currency);
  }

  return null;
}

/**
 * Scraped descriptions arrive as duty fragments joined with " | ", so rendered
 * raw they read as one run-on sentence full of pipes. This splits them back
 * into the list the source meant.
 *
 * Shared because two surfaces show the same text differently: the detail page
 * renders every duty as a bulleted list, the card shows a compact preview.
 * Both need the same parsing, and only one of them had it.
 */
export function splitDescriptionParts(text: string): string[] {
  return text
    .split(/\s*\|\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Tag slugs are internal identifiers; these are what a reader should see. */
const TAG_LABELS: Record<string, string> = {
  "skilled-trades": "Skilled trades",
  healthcare: "Healthcare",
  driving: "Driving",
  logistics: "Logistics",
  retail: "Retail",
  security: "Security",
  admin: "Admin",
  "food-service": "Food service",
  cleaning: "Cleaning",
  education: "Education",
  "full-time": "Full-time",
  "part-time": "Part-time",
  casual: "Casual",
  seasonal: "Seasonal",
  contract: "Contract",
};

/**
 * A tag as a person should read it.
 *
 * The derived tags are machine-facing — "skilled-trades", "experience:senior"
 * — and were rendering raw, so job cards showed the namespace and the hyphens
 * to the reader. Seniority is stripped of its prefix; anything unmapped is
 * de-slugged rather than dropped, so a new tag degrades to readable instead of
 * disappearing.
 */
export function formatTagLabel(tag: string): string {
  const value = tag.trim();
  if (!value) return "";

  if (value.startsWith("experience:")) {
    const level = value.slice("experience:".length);
    return level.charAt(0).toUpperCase() + level.slice(1);
  }

  return (
    TAG_LABELS[value.toLowerCase()] ??
    value.replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase())
  );
}

/**
 * How a job tag looks, everywhere.
 *
 * There were three treatments for the same chip: the detail page cycled a
 * five-colour rainbow keyed off a leftover map of `flutter`/`dart`/`ios`
 * (demo data from a Flutter job board, on a Canadian veterans' site), the
 * sidebar card used hardcoded hex fills, and the browse card used neutral
 * grey. The rainbow is why an industry tag rendered blue — a colour that
 * appears nowhere in the brand.
 *
 * One tint of the brand red instead. A tag is a category label, not a status,
 * so it carries no colour-coded meaning worth inventing a palette for; a tint
 * also keeps it below the solid-red Apply button in the hierarchy rather than
 * competing with it.
 */
export const JOB_TAG_CLASS =
  "px-2.5 py-1 rounded-full text-xs font-medium " +
  "bg-primary/10 text-primary ring-1 ring-primary/20";

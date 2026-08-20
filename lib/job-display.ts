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

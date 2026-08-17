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
  const sourceText = job.salary_text?.trim();
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

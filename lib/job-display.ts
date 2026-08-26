/**
 * Display helpers for job listings.
 *
 * These exist because the same two decisions — "where does applying actually
 * go?" and "what does this job pay?" — were previously made independently in
 * several components, and drifted. Aggregated (scraped) listings broke all of
 * them, so the rules live here and are unit-tested.
 */

import type { Job } from "@/types/job";
import { safeApplyUrl } from "@/lib/safe-url";
import {
  INDUSTRY_LABELS,
  JOB_TYPE_LABELS,
  WORK_ARRANGEMENT_LABELS,
  fieldLabel,
  type Industry,
} from "@/lib/job-fields";

type SourceFields = Pick<
  Job,
  "source" | "source_name" | "external_url" | "applicationLink"
>;

type SalaryFields = Pick<
  Job,
  "salary" | "salary_range" | "salary_text" | "payment_type"
>;

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
  // Both sources are untrusted (scraped external_url / employer-supplied
  // applicationLink); reject anything but http(s)/mailto so a "javascript:"
  // value can't turn the Apply button into a click-XSS.
  return safeApplyUrl(job.external_url) ?? safeApplyUrl(job.applicationLink) ?? null;
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
  // The stored column wins over any text inference — it is what the employer
  // actually selected. Text regexes remain for scraped listings, which carry
  // only the source board's wording.
  if (job.payment_type === "hourly") return "hourly";
  if (job.payment_type === "salary") return "annual";
  if (job.payment_type) return "unspecified";

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

  // "/year" was hardcoded here, so an hourly range read "$25 – $30K/year".
  // The employer's own payment type decides the wording; absent one, annual
  // remains the compact default it always was.
  const hourly = job.payment_type === "hourly";
  const suffix = hourly ? "/hour" : "/year";

  // Hourly is the one basis where cents are normal, so keep them — but only
  // when present, so "$25/hour" doesn't become "$25.00/hour". A bare
  // toLocaleString() rendered 18.5 as "$18.5".
  const hourlyDigits = (amount: number): string =>
    Number.isInteger(amount)
      ? amount.toLocaleString()
      : amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  const amount = (symbol: string, value: number, currency: string): string => {
    if (variant === "compact") {
      return hourly ? `${symbol}${hourlyDigits(value)}` : formatCompact(symbol, value);
    }
    return hourly
      ? `${symbol}${hourlyDigits(value)}${currency ? ` ${currency}` : ""}`
      : formatFull(symbol, value, currency);
  };
  // Compact always states the basis ("/year", "/hour"); full spells hourly
  // out as a word and leaves annual unmarked, as it always did.
  const tail = variant === "compact" ? suffix : hourly ? " hourly" : "";

  const startNum = start?.number ?? 0;
  const endNum = end?.number ?? 0;
  const sym = start?.symbol ?? end?.symbol ?? job.salary?.symbol ?? "$";
  const cur = start?.currency ?? end?.currency ?? job.salary?.currency ?? "";

  // A range needs both ends; one end alone is honest as "From" / "Up to"
  // rather than a fabricated equal pair or nothing at all.
  if (startNum && endNum) {
    return `${amount(sym, startNum, cur)} – ${amount(sym, endNum, cur)}${tail}`;
  }
  if (startNum) return `From ${amount(sym, startNum, cur)}${tail}`;
  if (endNum) return `Up to ${amount(sym, endNum, cur)}${tail}`;

  if (job.salary?.number) {
    return `${amount(job.salary.symbol, job.salary.number, job.salary.currency)}${tail}`;
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

/**
 * A tag as a person should read it.
 *
 * Tags carry one vocabulary now — industries — so the labels come from the
 * shared INDUSTRY_LABELS map. (The local map this replaces had drifted from
 * the classifier's actual slugs: it labelled "driving" and "admin" while the
 * classifier emits "driving-logistics" and "administration".) The
 * "experience:" strip survives for any pre-column row; anything unmapped is
 * de-slugged rather than dropped.
 */
export function formatTagLabel(tag: string): string {
  const value = tag.trim();
  if (!value) return "";

  if (value.startsWith("experience:")) {
    const level = value.slice("experience:".length);
    return level.charAt(0).toUpperCase() + level.slice(1);
  }

  return (
    fieldLabel<Industry>(INDUSTRY_LABELS, value.toLowerCase()) ??
    value
  );
}

/**
 * The chips a job card or detail page shows, from the structured columns:
 * category, employment shape, arrangement. One rule for every surface — the
 * detail page, browse card and sidebar card each used to assemble their own
 * set from raw tags, which is how "Full-time" rendered twice on one job.
 */
export function jobChipLabels(
  job: Pick<Job, "tags" | "job_category" | "job_type" | "work_arrangement">,
): string[] {
  const industryChips = job.job_category
    ? [fieldLabel(INDUSTRY_LABELS, job.job_category)]
    : (job.tags ?? []).map((tag) => formatTagLabel(tag.name));

  const chips = [
    ...industryChips,
    fieldLabel(JOB_TYPE_LABELS, job.job_type),
    fieldLabel(WORK_ARRANGEMENT_LABELS, job.work_arrangement),
  ].filter((chip): chip is string => Boolean(chip));

  return [...new Set(chips)];
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

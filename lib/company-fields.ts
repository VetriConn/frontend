/**
 * The company-industry vocabulary — the ONE list.
 *
 * Company.industry used to be served by three lists (a module-local copy in
 * the application form, a dead near-duplicate in lib/validation.ts, and a
 * free-text editor field that could overwrite the slug with prose), and the
 * public profile then resolved the stored slugs against the JOB taxonomy,
 * quietly swapping labels. Every writer and reader goes through this module
 * now.
 *
 * Deliberately separate from the job taxonomy (lib/job-fields INDUSTRIES):
 * jobs are classified for seekers browsing roles; a company describes its own
 * sector. The two lists share some slugs but are different vocabularies.
 */
export const COMPANY_INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology & Consulting" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance & Banking" },
  { value: "education", label: "Education" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail & E-Commerce" },
  { value: "construction", label: "Construction" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "media", label: "Media & Entertainment" },
  { value: "transportation", label: "Transportation & Logistics" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "agriculture", label: "Agriculture" },
  { value: "legal", label: "Legal Services" },
  { value: "nonprofit", label: "Nonprofit & NGO" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

const LABEL_BY_VALUE = new Map<string, string>(
  COMPANY_INDUSTRY_OPTIONS.map((o) => [o.value, o.label]),
);

/**
 * Display label for a stored company industry. Unknown values (legacy
 * free-text entries) de-slug rather than render raw.
 */
export function companyIndustryLabel(value?: string | null): string | null {
  if (!value) return null;
  const known = LABEL_BY_VALUE.get(value);
  if (known) return known;
  const cleaned = value.replace(/[-_]/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

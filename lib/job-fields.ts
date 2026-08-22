/**
 * The job-field vocabularies and their reader-facing labels, defined once.
 *
 * Mirrors backend/src/constants/jobFields.ts — the two files must agree. Every
 * dropdown, chip, filter and review pane that talks about these fields reads
 * from here; the previous arrangement had the Post-a-Job form, the filter
 * panel and the tag-label map each declaring their own list, already
 * disagreeing about which values exist.
 */

export const JOB_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "temporary",
  "internship",
  "casual",
  "seasonal",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  temporary: "Temporary",
  internship: "Internship",
  casual: "Casual",
  seasonal: "Seasonal",
};

/**
 * Where the work happens. Previously mislabelled "employment type" in the
 * form — a phrase every other surface uses for JOB_TYPES.
 */
export const WORK_ARRANGEMENTS = ["onsite", "remote", "hybrid"] as const;

export type WorkArrangement = (typeof WORK_ARRANGEMENTS)[number];

export const WORK_ARRANGEMENT_LABELS: Record<WorkArrangement, string> = {
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

export const EXPERIENCE_LEVELS = [
  "entry",
  "mid",
  "senior",
  "lead",
  "executive",
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  entry: "Entry level",
  mid: "Mid level",
  senior: "Senior level",
  lead: "Lead",
  executive: "Executive",
};

/** Physical intensity only; schedule values moved to WORK_SCHEDULES. */
export const PHYSICAL_DEMANDS = ["none", "light", "moderate", "heavy"] as const;

export type PhysicalDemands = (typeof PHYSICAL_DEMANDS)[number];

export const PHYSICAL_DEMAND_LABELS: Record<PhysicalDemands, string> = {
  none: "No physical demands",
  light: "Light — mostly seated or standing",
  moderate: "Moderate — some lifting or movement",
  heavy: "Heavy — regular physical activity",
};

export const WORK_SCHEDULES = [
  "standard-hours",
  "flexible",
  "shift-based",
  "weekdays",
  "weekends",
] as const;

export type WorkSchedule = (typeof WORK_SCHEDULES)[number];

export const WORK_SCHEDULE_LABELS: Record<WorkSchedule, string> = {
  "standard-hours": "Standard business hours",
  flexible: "Flexible hours",
  "shift-based": "Shift work",
  weekdays: "Weekdays",
  weekends: "Weekends",
};

export const PAYMENT_TYPES = [
  "salary",
  "hourly",
  "commission",
  "stipend",
  "volunteer",
] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  salary: "Annual Salary",
  hourly: "Hourly Rate",
  commission: "Commission-based",
  stipend: "Stipend",
  volunteer: "Volunteer / Unpaid",
};

/**
 * Industries, shared with the scraper's classifier and the Post-a-Job
 * category dropdown. Replaces the form's old tech-startup category list
 * (design, product, data, hr), which matched neither the audience nor any
 * filter. (The job-seeker profile keeps its own broader, veteran-focused
 * industry list — that taxonomy is deliberately separate.)
 */
export const INDUSTRIES = [
  "skilled-trades",
  "healthcare",
  "driving-logistics",
  "retail",
  "food-service",
  "security",
  "administration",
  "education",
  "hospitality",
  "cleaning-maintenance",
  "agriculture",
  "manufacturing",
  "technology",
  "finance",
  "construction",
  "customer-service",
  "childcare",
  "creative-design",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const INDUSTRY_LABELS: Record<Industry, string> = {
  "skilled-trades": "Skilled Trades",
  healthcare: "Healthcare",
  "driving-logistics": "Driving & Logistics",
  retail: "Retail",
  "food-service": "Food Service",
  security: "Security",
  administration: "Administration",
  education: "Education",
  hospitality: "Hospitality",
  "cleaning-maintenance": "Cleaning & Maintenance",
  agriculture: "Agriculture",
  manufacturing: "Manufacturing",
  technology: "Technology",
  finance: "Finance",
  construction: "Construction",
  "customer-service": "Customer Service",
  childcare: "Childcare",
  "creative-design": "Creative & Design",
};

/** Canadian provinces and territories, for the posting form and filters. */
export const PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
] as const;

export type ProvinceCode = (typeof PROVINCES)[number]["code"];

/** {value, label} pairs for a <select>, from a vocabulary and its labels. */
export function toOptions<V extends string>(
  values: readonly V[],
  labels: Record<V, string>,
): { value: V; label: string }[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

/**
 * Label for a possibly-legacy value: exact vocabulary hit first, then a
 * de-slugged fallback so an unknown value degrades to readable rather than
 * disappearing or rendering raw.
 */
export function fieldLabel<V extends string>(
  labels: Record<V, string>,
  value: string | undefined | null,
): string | null {
  if (!value) return null;
  if (value in labels) return labels[value as V];
  return value.replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase());
}

// ─── Phase-1 job-builder vocabularies ────────────────────────────────────────
// Mirrors backend/src/constants/jobFields.ts, with reader-facing labels.

export const MIN_QUALIFICATIONS = [
  "none",
  "high-school",
  "apprenticeship",
  "college",
  "bachelor",
  "postgrad",
] as const;
export type MinQualification = (typeof MIN_QUALIFICATIONS)[number];
export const MIN_QUALIFICATION_LABELS: Record<MinQualification, string> = {
  none: "No formal requirement",
  "high-school": "Secondary school",
  apprenticeship: "Registered apprenticeship / trade certificate",
  college: "College or CEGEP diploma",
  bachelor: "Bachelor's degree",
  postgrad: "Master's or Doctorate",
};

export const SECURITY_CLEARANCES = [
  "none",
  "reliability",
  "secret",
  "top-secret",
] as const;
export type SecurityClearance = (typeof SECURITY_CLEARANCES)[number];
export const SECURITY_CLEARANCE_LABELS: Record<SecurityClearance, string> = {
  none: "Not required",
  reliability: "Reliability Status",
  secret: "Secret (Level II)",
  "top-secret": "Top Secret (Level III)",
};

export const LANGUAGES = [
  "english",
  "french",
  "spanish",
  "mandarin",
  "cantonese",
  "punjabi",
  "arabic",
  "tagalog",
  "other",
] as const;
export type Language = (typeof LANGUAGES)[number];
export const LANGUAGE_LABELS: Record<Language, string> = {
  english: "English",
  french: "French",
  spanish: "Spanish",
  mandarin: "Mandarin",
  cantonese: "Cantonese",
  punjabi: "Punjabi",
  arabic: "Arabic",
  tagalog: "Tagalog",
  other: "Other",
};

export const BENEFITS = [
  "health",
  "dental",
  "vision",
  "life-insurance",
  "disability",
  "pension",
  "vacation",
  "sick-leave",
  "paid-overtime",
  "bonus",
  "flexible-hours",
  "travel",
  "discount",
  "wellness",
  "training",
  "relocation",
] as const;
export type Benefit = (typeof BENEFITS)[number];
export const BENEFIT_LABELS: Record<Benefit, string> = {
  health: "Health / Medical",
  dental: "Dental",
  vision: "Vision",
  "life-insurance": "Life insurance",
  disability: "Disability insurance",
  pension: "RRSP / pension matching",
  vacation: "Paid vacation",
  "sick-leave": "Paid sick leave",
  "paid-overtime": "Paid overtime",
  bonus: "Performance bonus",
  "flexible-hours": "Flexible hours",
  travel: "Travel / mileage",
  discount: "Employee discount",
  wellness: "Wellness / gym",
  training: "Training & development",
  relocation: "Relocation assistance",
};

export const CURRENCIES = ["CAD", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const CURRENCY_LABELS: Record<Currency, string> = {
  CAD: "CAD ($)",
  USD: "USD ($)",
};

/**
 * Phase-2 screening-question types. Mirrors SCREENING_QUESTION_TYPES on the
 * backend. Each attaches to a job; candidates answer at apply time and the
 * answers feed the rank-and-flag score (they never auto-reject).
 */
export const SCREENING_QUESTION_TYPES = [
  "yes_no",
  "single_choice",
  "multi_choice",
  "short_text",
] as const;
export type ScreeningQuestionType = (typeof SCREENING_QUESTION_TYPES)[number];
export const SCREENING_QUESTION_TYPE_LABELS: Record<
  ScreeningQuestionType,
  string
> = {
  yes_no: "Yes / No",
  single_choice: "Multiple choice (pick one)",
  multi_choice: "Multiple choice (pick many)",
  short_text: "Short answer",
};

/** A screening question and its scoring hints (mirrors the backend shape). */
export interface ScreeningQuestion {
  id: string;
  question: string;
  type: ScreeningQuestionType;
  options?: string[];
  preferred_answers?: string[];
  weight?: number;
  required?: boolean;
  knockout?: boolean;
}

/** A public question-and-answer pair shown on the job listing. */
export interface JobFaq {
  question: string;
  answer: string;
}

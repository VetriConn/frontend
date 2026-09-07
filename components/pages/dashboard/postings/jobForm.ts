/**
 * The job builder's data layer: step definitions, the form's shape and blank
 * state, the dropdown option lists derived from the shared vocabularies, and
 * the payload-cleaning helpers. Split from CreateJobPosting.tsx (#47), which
 * carried all of this plus the form kit, six steps and the orchestrator in
 * one 2,100-line file.
 */
import {
  INDUSTRIES,
  INDUSTRY_LABELS,
  JOB_TYPES as JOB_TYPE_VALUES,
  JOB_TYPE_LABELS,
  WORK_ARRANGEMENTS as WORK_ARRANGEMENT_VALUES,
  WORK_ARRANGEMENT_LABELS,
  EXPERIENCE_LEVELS as EXPERIENCE_LEVEL_VALUES,
  EXPERIENCE_LEVEL_LABELS,
  PHYSICAL_DEMANDS as PHYSICAL_DEMAND_VALUES,
  PHYSICAL_DEMAND_LABELS,
  WORK_SCHEDULES as WORK_SCHEDULE_VALUES,
  WORK_SCHEDULE_LABELS,
  PAYMENT_TYPES as PAYMENT_TYPE_VALUES,
  PAYMENT_TYPE_LABELS,
  MIN_QUALIFICATIONS as MIN_QUALIFICATION_VALUES,
  MIN_QUALIFICATION_LABELS,
  SECURITY_CLEARANCES as SECURITY_CLEARANCE_VALUES,
  SECURITY_CLEARANCE_LABELS,
  LANGUAGES as LANGUAGE_VALUES,
  LANGUAGE_LABELS,
  BENEFITS as BENEFIT_VALUES,
  BENEFIT_LABELS,
  CURRENCIES as CURRENCY_VALUES,
  CURRENCY_LABELS,
  toOptions,
  type ScreeningQuestion,
  type JobFaq,
} from "@/lib/job-fields";

// ─── Constants ───────────────────────────────────────────────────────────────

export const WIZARD_STEPS = [
  { number: 1, label: "Job Details" },
  { number: 2, label: "Description" },
  { number: 3, label: "Requirements" },
  { number: 4, label: "Salary & Location" },
  { number: 5, label: "Screening & Hiring" },
  { number: 6, label: "Review" },
];

// The lite "quick post" path — one Essentials step, then Preview. Aimed at an
// individual posting a single job; companies use the full builder for the
// richer data that powers matching.
export const LITE_STEPS = [
  { number: 1, label: "Essentials" },
  { number: 2, label: "Preview" },
];

/**
 * Dropdown options, derived from the shared vocabularies in lib/job-fields —
 * the same values the backend validates, the scraper's classifier emits and
 * the browse filters query. This form used to declare its own lists, which
 * offered a tech-startup category set no filter could match, called
 * remote/onsite/hybrid an "employment type", and mixed schedule values into
 * the physical-demands select.
 */
export const JOB_CATEGORIES = toOptions(INDUSTRIES, INDUSTRY_LABELS);
export const JOB_TYPES = toOptions(JOB_TYPE_VALUES, JOB_TYPE_LABELS);
export const WORK_ARRANGEMENTS = toOptions(
  WORK_ARRANGEMENT_VALUES,
  WORK_ARRANGEMENT_LABELS,
);
export const EXPERIENCE_LEVELS = toOptions(
  EXPERIENCE_LEVEL_VALUES,
  EXPERIENCE_LEVEL_LABELS,
);
export const PHYSICAL_DEMANDS = toOptions(
  PHYSICAL_DEMAND_VALUES,
  PHYSICAL_DEMAND_LABELS,
);
export const WORK_SCHEDULES = toOptions(WORK_SCHEDULE_VALUES, WORK_SCHEDULE_LABELS);
export const PAYMENT_TYPES = toOptions(PAYMENT_TYPE_VALUES, PAYMENT_TYPE_LABELS);
export const MIN_QUALIFICATIONS = toOptions(
  MIN_QUALIFICATION_VALUES,
  MIN_QUALIFICATION_LABELS,
);
export const SECURITY_CLEARANCES = toOptions(
  SECURITY_CLEARANCE_VALUES,
  SECURITY_CLEARANCE_LABELS,
);
export const LANGUAGES = toOptions(LANGUAGE_VALUES, LANGUAGE_LABELS);
export const BENEFITS = toOptions(BENEFIT_VALUES, BENEFIT_LABELS);
export const CURRENCIES = toOptions(CURRENCY_VALUES, CURRENCY_LABELS);

/** The value a select hands back is only trusted after this membership check. */
export function asVocab<V extends string>(
  values: readonly V[],
  value: string,
): V | "" {
  return (values as readonly string[]).includes(value) ? (value as V) : "";
}

export interface JobFormData {
  // Step 1 — Job Details
  job_title: string;
  job_category: string;
  job_type: string;
  work_arrangement: string;

  // Step 2 — Description
  description: string;
  responsibilities: string; // one item per line
  requirements: string; // one item per line → qualifications[]

  // Step 3 — Requirements & Experience
  experience_level: string;
  skills: string;
  physical_demands: string;

  // Step 4 — Salary & Location
  salary_min: string;
  salary_max: string;
  payment_type: string;
  currency: string;
  city: string;
  state_province: string;
  country: string;
  work_schedule: string;

  // Phase-1 job-builder fields
  min_qualification: string;
  security_clearance: string;
  requires_drivers_license: boolean;
  visa_sponsorship: boolean;
  veteran_friendly: boolean;
  accommodations_offered: boolean;
  physically_accessible: boolean;
  open_to_returners: boolean;
  languages: string[];
  benefits: string[];
  certifications: string; // comma-separated free text
  openings: string;
  application_deadline: string;
  start_date: string;

  // Phase-2 job-builder fields (Step 5 — Screening & Hiring)
  screening_questions: ScreeningQuestion[];
  faqs: JobFaq[];
  hiring_stages: string[];
}

export interface FormErrors {
  [key: string]: string;
}

export const INITIAL_FORM_DATA: JobFormData = {
  job_title: "",
  job_category: "",
  job_type: "",
  work_arrangement: "",
  description: "",
  responsibilities: "",
  requirements: "",
  experience_level: "",
  skills: "",
  physical_demands: "",
  salary_min: "",
  salary_max: "",
  payment_type: "",
  currency: "CAD",
  city: "",
  state_province: "",
  country: "Canada",
  work_schedule: "",
  min_qualification: "",
  security_clearance: "",
  requires_drivers_license: false,
  visa_sponsorship: false,
  veteran_friendly: false,
  accommodations_offered: false,
  physically_accessible: false,
  open_to_returners: false,
  languages: [],
  benefits: [],
  certifications: "",
  openings: "",
  application_deadline: "",
  start_date: "",
  screening_questions: [],
  faqs: [],
  hiring_stages: [],
};

// ─── Phase-2 payload cleaners ────────────────────────────────────────────────
// The editors keep half-filled rows while you type; these strip them out at
// submit time so a blank row never reaches the server or a live listing.

export function cleanScreeningQuestions(
  questions: ScreeningQuestion[],
): ScreeningQuestion[] | undefined {
  const cleaned = questions
    .filter((q) => q.question.trim())
    .map((q) => {
      const isChoice = q.type === "single_choice" || q.type === "multi_choice";
      const options = isChoice
        ? (q.options ?? []).map((o) => o.trim()).filter(Boolean)
        : undefined;
      const valid =
        q.type === "yes_no"
          ? ["yes", "no"]
          : isChoice
            ? (options ?? [])
            : [];
      const preferred = (q.preferred_answers ?? []).filter((a) =>
        valid.includes(a),
      );
      return {
        id: q.id,
        question: q.question.trim(),
        type: q.type,
        ...(options ? { options } : {}),
        ...(preferred.length ? { preferred_answers: preferred } : {}),
        ...(q.type !== "short_text" ? { weight: q.weight ?? 3 } : {}),
        ...(q.required ? { required: true } : {}),
        ...(q.knockout && preferred.length ? { knockout: true } : {}),
      } satisfies ScreeningQuestion;
    });
  return cleaned.length ? cleaned : undefined;
}

export function cleanFaqs(faqs: JobFaq[]): JobFaq[] | undefined {
  const cleaned = faqs
    .filter((f) => f.question.trim() && f.answer.trim())
    .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }));
  return cleaned.length ? cleaned : undefined;
}

export function cleanStages(stages: string[]): string[] | undefined {
  const cleaned = stages.map((s) => s.trim()).filter(Boolean);
  return cleaned.length ? cleaned : undefined;
}

// Skills are stored as one comma/newline string (the public page splits them
// the same way); the pill input works in arrays, so convert at the boundary.
export function splitSkills(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// A "one item per line" textarea → a clean list; empty → undefined so the
// column is omitted rather than stored as [].
export function linesToList(text: string): string[] | undefined {
  const items = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

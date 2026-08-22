"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { mutate } from "swr";
import {
  HiOutlineBriefcase,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineClipboardDocument,
  HiCheck,
} from "react-icons/hi2";
import { useToaster } from "@/components/ui/Toaster";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { SkillsInput } from "@/components/ui/SkillsInput";
import { CountrySelect } from "@/components/ui/CountrySelect";
import {
  regionsFor,
  hasRegions,
  regionLabelFor,
  regionName,
} from "@/lib/regions";
import { StepHiring } from "@/components/pages/dashboard/postings/HiringStep";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMyCompanies } from "@/hooks/useCompanies";
import { canPostJobsFor } from "@/lib/api";
import {
  createPosting,
  getMyPosting,
  updatePosting,
  getSkillSuggestions,
} from "@/lib/api";
import type { PostedJobDetail } from "@/types/api";
import type { CreateJobInput } from "@/lib/api/postings";
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

const WIZARD_STEPS = [
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
const LITE_STEPS = [
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
const JOB_CATEGORIES = toOptions(INDUSTRIES, INDUSTRY_LABELS);
const JOB_TYPES = toOptions(JOB_TYPE_VALUES, JOB_TYPE_LABELS);
const WORK_ARRANGEMENTS = toOptions(
  WORK_ARRANGEMENT_VALUES,
  WORK_ARRANGEMENT_LABELS,
);
const EXPERIENCE_LEVELS = toOptions(
  EXPERIENCE_LEVEL_VALUES,
  EXPERIENCE_LEVEL_LABELS,
);
const PHYSICAL_DEMANDS = toOptions(
  PHYSICAL_DEMAND_VALUES,
  PHYSICAL_DEMAND_LABELS,
);
const WORK_SCHEDULES = toOptions(WORK_SCHEDULE_VALUES, WORK_SCHEDULE_LABELS);
const PAYMENT_TYPES = toOptions(PAYMENT_TYPE_VALUES, PAYMENT_TYPE_LABELS);
const MIN_QUALIFICATIONS = toOptions(
  MIN_QUALIFICATION_VALUES,
  MIN_QUALIFICATION_LABELS,
);
const SECURITY_CLEARANCES = toOptions(
  SECURITY_CLEARANCE_VALUES,
  SECURITY_CLEARANCE_LABELS,
);
const LANGUAGES = toOptions(LANGUAGE_VALUES, LANGUAGE_LABELS);
const BENEFITS = toOptions(BENEFIT_VALUES, BENEFIT_LABELS);
const CURRENCIES = toOptions(CURRENCY_VALUES, CURRENCY_LABELS);

/** The value a select hands back is only trusted after this membership check. */
function asVocab<V extends string>(
  values: readonly V[],
  value: string,
): V | "" {
  return (values as readonly string[]).includes(value) ? (value as V) : "";
}

interface JobFormData {
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

interface FormErrors {
  [key: string]: string;
}

const INITIAL_FORM_DATA: JobFormData = {
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

function cleanScreeningQuestions(
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

function cleanFaqs(faqs: JobFaq[]): JobFaq[] | undefined {
  const cleaned = faqs
    .filter((f) => f.question.trim() && f.answer.trim())
    .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }));
  return cleaned.length ? cleaned : undefined;
}

function cleanStages(stages: string[]): string[] | undefined {
  const cleaned = stages.map((s) => s.trim()).filter(Boolean);
  return cleaned.length ? cleaned : undefined;
}

// Skills are stored as one comma/newline string (the public page splits them
// the same way); the pill input works in arrays, so convert at the boundary.
function splitSkills(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// A "one item per line" textarea → a clean list; empty → undefined so the
// column is omitted rather than stored as [].
function linesToList(text: string): string[] | undefined {
  const items = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

// ─── Shared UI Helpers ───────────────────────────────────────────────────────

const inputClasses =
  "w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white";

const errorInputClasses =
  "w-full px-3 py-2 md:px-4 md:py-3 border border-red-500 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white";

function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2"
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs md:text-sm text-gray-400 mt-1">{children}</p>;
}

/**
 * A themed select, adapting the shared CustomDropdown to the builder's
 * (field, value) change signature. Replaces every native <select> so the whole
 * builder shows one Vetriconn-styled menu instead of the OS dropdown.
 */
function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  required,
  error,
  helperText,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}) {
  return (
    <CustomDropdown
      name={id}
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      required={required}
      error={error}
      helperText={helperText}
      hideHeader
    />
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

/**
 * A multi-select rendered as toggle chips — used for languages and benefits.
 * Each chip is a real toggle button (aria-pressed), sized to a 44px touch
 * target, and turns Vetriconn red when selected so it reads clearly at high
 * contrast and scaled text.
 */
function ChipGroup({
  options,
  selected,
  onToggle,
  ariaLabel,
}: {
  options: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isOn = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(opt.value)}
            className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isOn
                ? "border-primary bg-primary text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * An accessible labelled checkbox row — used for the yes/no eligibility and
 * inclusion flags. The whole row is the label so the tap target is generous.
 */
function ToggleRow({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-primary/40"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
      />
      <span>
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-gray-500">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

/**
 * Country → Province/State → City, in that order. The country drives the
 * middle field: a themed dropdown of that country's regions where we enumerate
 * them (Canada, US), or free text elsewhere — labelled correctly per country.
 * Shared by the full builder and the lite Essentials step so location behaves
 * identically in both.
 */
function LocationFields({
  country,
  stateProvince,
  city,
  onChange,
  cityRequired = false,
  cityError,
}: {
  country: string;
  stateProvince: string;
  city: string;
  onChange: (field: keyof JobFormData, value: string) => void;
  cityRequired?: boolean;
  cityError?: string;
}) {
  const regionLabel = regionLabelFor(country);
  const changeCountry = (value: string) => {
    onChange("country", value);
    // The stored region code is country-specific, so a country change clears it.
    if (value !== country) onChange("state_province", "");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <CountrySelect
        value={country}
        onChange={changeCountry}
        label="Country"
        name="country"
      />

      {hasRegions(country) ? (
        <SelectField
          id="state_province"
          label={regionLabel}
          value={stateProvince}
          onChange={(v) => onChange("state_province", v)}
          options={regionsFor(country).map((r) => ({
            value: r.code,
            label: r.name,
          }))}
          placeholder={`Select ${regionLabel.toLowerCase()}`}
        />
      ) : (
        <div>
          <FieldLabel htmlFor="state_province">{regionLabel}</FieldLabel>
          <input
            id="state_province"
            type="text"
            value={stateProvince}
            onChange={(e) => onChange("state_province", e.target.value)}
            placeholder={`e.g. ${country === "Nigeria" ? "Lagos" : "Region"}`}
            className={inputClasses}
          />
        </div>
      )}

      <div>
        <FieldLabel htmlFor="city" required={cityRequired}>
          City
        </FieldLabel>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="e.g. Toronto"
          className={cityError ? errorInputClasses : inputClasses}
        />
        <FieldError message={cityError} />
      </div>
    </div>
  );
}

// ─── Step Components ─────────────────────────────────────────────────────────

function StepJobDetails({
  formData,
  errors,
  onChange,
}: {
  formData: JobFormData;
  errors: FormErrors;
  onChange: (field: keyof JobFormData, value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Job Details</h2>
      <p className="text-sm md:text-base text-gray-500 mb-6">
        Define the basic identity of the job you&apos;re posting.
      </p>

      <div className="space-y-5">
        {/* Job Title */}
        <div>
          <FieldLabel htmlFor="job_title" required>
            Job Title
          </FieldLabel>
          <input
            id="job_title"
            type="text"
            value={formData.job_title}
            onChange={(e) => onChange("job_title", e.target.value)}
            placeholder="e.g., Customer Service Representative"
            className={errors.job_title ? errorInputClasses : inputClasses}
          />
          <HelperText>
            Use clear titles so older applicants can understand the role easily.
          </HelperText>
          <FieldError message={errors.job_title} />
        </div>

        {/* Job Category */}
        <SelectField
          id="job_category"
          label="Job Category"
          value={formData.job_category}
          onChange={(v) => onChange("job_category", v)}
          options={JOB_CATEGORIES}
          placeholder="Select a category"
          required
          error={errors.job_category}
        />

        {/* Job Type & Employment Type — side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <SelectField
            id="job_type"
            label="Job Type"
            value={formData.job_type}
            onChange={(v) => onChange("job_type", v)}
            options={JOB_TYPES}
            placeholder="Select type"
          />
          <SelectField
            id="work_arrangement"
            label="Work Arrangement"
            value={formData.work_arrangement}
            onChange={(v) => onChange("work_arrangement", v)}
            options={WORK_ARRANGEMENTS}
            placeholder="Select work arrangement"
          />
        </div>
      </div>
    </div>
  );
}

function StepDescription({
  formData,
  errors,
  onChange,
}: {
  formData: JobFormData;
  errors: FormErrors;
  onChange: (field: keyof JobFormData, value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Job Description
      </h2>
      <p className="text-sm md:text-base text-gray-500 mb-6">
        Explain the role simply and honestly to help candidates understand what
        to expect. Use formatting to keep it scannable.
      </p>

      <FieldLabel htmlFor="description" required>
        Job Brief
      </FieldLabel>
      <RichTextEditor
        id="description"
        value={formData.description}
        onChange={(html) => onChange("description", html)}
        placeholder="What is this role, and what will they do day to day?"
        hasError={Boolean(errors.description)}
        ariaLabel="Job brief"
      />
      <FieldError message={errors.description} />

      {/* What You'll Do — the section whose data used to get buried. */}
      <div className="mt-6">
        <FieldLabel htmlFor="responsibilities" required>
          What You&apos;ll Do
        </FieldLabel>
        <HelperText>List the main responsibilities — one per line.</HelperText>
        <textarea
          id="responsibilities"
          value={formData.responsibilities}
          onChange={(e) => onChange("responsibilities", e.target.value)}
          rows={5}
          placeholder={
            "Greet and assist customers\nOperate the point-of-sale system\nKeep the work area clean and stocked"
          }
          className={`mt-1.5 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none ${
            errors.responsibilities ? "border-red-500" : "border-gray-200"
          }`}
        />
        <FieldError message={errors.responsibilities} />
      </div>

      {/* What We're Looking For — optional requirement bullets. */}
      <div className="mt-6">
        <FieldLabel htmlFor="requirements">What We&apos;re Looking For</FieldLabel>
        <HelperText>
          List key requirements or qualifications — one per line. Optional.
        </HelperText>
        <textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => onChange("requirements", e.target.value)}
          rows={4}
          placeholder={
            "Comfortable on your feet for a full shift\nFriendly, reliable, and punctual\nRetail experience is a plus"
          }
          className="mt-1.5 w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
        />
      </div>
    </div>
  );
}

function StepRequirements({
  formData,
  onChange,
  onSet,
  onToggle,
}: {
  formData: JobFormData;
  errors: FormErrors;
  onChange: (field: keyof JobFormData, value: string) => void;
  onSet: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
  onToggle: (field: "languages" | "benefits", value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Requirements &amp; Experience
      </h2>
      <p className="text-sm md:text-base text-gray-500 mb-6">
        Set realistic expectations for veterans and retirees.
      </p>

      <div className="space-y-5">
        {/* Experience Level */}
        <SelectField
          id="experience_level"
          label="Experience Level"
          value={formData.experience_level}
          onChange={(v) => onChange("experience_level", v)}
          options={EXPERIENCE_LEVELS}
          placeholder="Select experience level"
        />

        {/* Required Skills */}
        <SkillsInput
          id="skills"
          label="Required Skills"
          helperText="Search and pick the skills essential for this role, or type your own and press Enter."
          value={splitSkills(formData.skills)}
          onChange={(skills) => onChange("skills", skills.join(", "))}
          fetchSuggestions={getSkillSuggestions}
        />

        {/* Physical or Time Demands */}
        <SelectField
          id="physical_demands"
          label="Physical or Time Demands (Optional)"
          value={formData.physical_demands}
          onChange={(v) => onChange("physical_demands", v)}
          options={PHYSICAL_DEMANDS}
          placeholder="Select physical or time demands"
        />

        {/* Minimum education & security clearance — side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <SelectField
            id="min_qualification"
            label="Minimum Education"
            value={formData.min_qualification}
            onChange={(v) => onChange("min_qualification", v)}
            options={MIN_QUALIFICATIONS}
            placeholder="No minimum"
          />
          <SelectField
            id="security_clearance"
            label="Security Clearance"
            value={formData.security_clearance}
            onChange={(v) => onChange("security_clearance", v)}
            options={SECURITY_CLEARANCES}
            placeholder="None required"
            helperText="Many veterans already hold a clearance — flagging it helps matching."
          />
        </div>

        {/* Languages */}
        <div>
          <FieldLabel>Languages</FieldLabel>
          <HelperText>Select any languages this role needs.</HelperText>
          <div className="mt-2">
            <ChipGroup
              options={LANGUAGES}
              selected={formData.languages}
              onToggle={(v) => onToggle("languages", v)}
              ariaLabel="Languages required"
            />
          </div>
        </div>

        {/* Certifications */}
        <div>
          <FieldLabel htmlFor="certifications">
            Certifications or Licences (Optional)
          </FieldLabel>
          <input
            id="certifications"
            type="text"
            value={formData.certifications}
            onChange={(e) => onChange("certifications", e.target.value)}
            placeholder="e.g. First Aid, Forklift, Class 5 Licence"
            className={inputClasses}
          />
          <HelperText>Separate each with a comma.</HelperText>
        </div>

        {/* Practical requirements */}
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium text-gray-700">
            Practical requirements
          </legend>
          <ToggleRow
            id="requires_drivers_license"
            checked={formData.requires_drivers_license}
            onChange={(v) => onSet("requires_drivers_license", v)}
            label="A driver's licence is required"
          />
          <ToggleRow
            id="visa_sponsorship"
            checked={formData.visa_sponsorship}
            onChange={(v) => onSet("visa_sponsorship", v)}
            label="Visa sponsorship is available"
            description="Show this if you can sponsor candidates who need it."
          />
        </fieldset>

        {/* Inclusion & mission — the fields that make Vetriconn matching work */}
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium text-gray-700">
            Inclusion &amp; fit
          </legend>
          <ToggleRow
            id="veteran_friendly"
            checked={formData.veteran_friendly}
            onChange={(v) => onSet("veteran_friendly", v)}
            label="Veteran-friendly"
            description="You welcome and value military experience."
          />
          <ToggleRow
            id="open_to_returners"
            checked={formData.open_to_returners}
            onChange={(v) => onSet("open_to_returners", v)}
            label="Open to returners"
            description="Great for people re-entering work after a career break."
          />
          <ToggleRow
            id="accommodations_offered"
            checked={formData.accommodations_offered}
            onChange={(v) => onSet("accommodations_offered", v)}
            label="Workplace accommodations offered"
          />
          <ToggleRow
            id="physically_accessible"
            checked={formData.physically_accessible}
            onChange={(v) => onSet("physically_accessible", v)}
            label="Physically accessible workplace"
          />
        </fieldset>
      </div>
    </div>
  );
}

function StepSalaryLocation({
  formData,
  errors,
  onChange,
  onToggle,
}: {
  formData: JobFormData;
  errors: FormErrors;
  onChange: (field: keyof JobFormData, value: string) => void;
  onToggle: (field: "languages" | "benefits", value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Salary &amp; Location
      </h2>
      <p className="text-sm md:text-base text-gray-500 mb-6">
        Be transparent about compensation and location to reduce uncertainty for
        applicants.
      </p>

      <div className="space-y-4 md:space-y-6">
        {/* Minimum / Maximum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <FieldLabel htmlFor="salary_min">Minimum</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                id="salary_min"
                type="number"
                value={formData.salary_min}
                onChange={(e) => onChange("salary_min", e.target.value)}
                min="0"
                className={`${errors.salary_min ? "border-red-500" : "border-gray-200"} w-full pl-7 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white`}
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="salary_max">Maximum</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                id="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={(e) => onChange("salary_max", e.target.value)}
                min="0"
                className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
              />
            </div>
          </div>
        </div>
        {errors.salary_min && <FieldError message={errors.salary_min} />}

        {/* Payment Type & Currency — side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <SelectField
            id="payment_type"
            label="Payment Type"
            value={formData.payment_type}
            onChange={(v) => onChange("payment_type", v)}
            options={PAYMENT_TYPES}
            placeholder="Select payment type"
          />
          <SelectField
            id="currency"
            label="Currency"
            value={formData.currency}
            onChange={(v) => onChange("currency", v)}
            options={CURRENCIES}
            placeholder="Currency"
          />
        </div>

        {/* Country → Province/State → City */}
        <LocationFields
          country={formData.country}
          stateProvince={formData.state_province}
          city={formData.city}
          onChange={onChange}
          cityRequired
          cityError={errors.city}
        />

        {/* Work Schedule */}
        <SelectField
          id="work_schedule"
          label="Work Schedule"
          value={formData.work_schedule}
          onChange={(v) => onChange("work_schedule", v)}
          options={WORK_SCHEDULES}
          placeholder="Select schedule type"
        />

        {/* Benefits */}
        <div>
          <FieldLabel>Benefits &amp; Perks</FieldLabel>
          <HelperText>Select everything this role offers.</HelperText>
          <div className="mt-2">
            <ChipGroup
              options={BENEFITS}
              selected={formData.benefits}
              onToggle={(v) => onToggle("benefits", v)}
              ariaLabel="Benefits and perks"
            />
          </div>
        </div>

        {/* Openings / Deadline / Start date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <FieldLabel htmlFor="openings">Openings</FieldLabel>
            <input
              id="openings"
              type="number"
              min="1"
              value={formData.openings}
              onChange={(e) => onChange("openings", e.target.value)}
              placeholder="1"
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel htmlFor="application_deadline">
              Application Deadline
            </FieldLabel>
            <input
              id="application_deadline"
              type="date"
              value={formData.application_deadline}
              onChange={(e) =>
                onChange("application_deadline", e.target.value)
              }
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel htmlFor="start_date">Expected Start</FieldLabel>
            <input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => onChange("start_date", e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepEssentials({
  formData,
  errors,
  onChange,
}: {
  formData: JobFormData;
  errors: FormErrors;
  onChange: (field: keyof JobFormData, value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        The essentials
      </h2>
      <p className="text-sm md:text-base text-gray-500 mb-6">
        Just the basics to get your job live. You can always edit it later.
      </p>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <FieldLabel htmlFor="job_title" required>
            Job Title
          </FieldLabel>
          <input
            id="job_title"
            type="text"
            value={formData.job_title}
            onChange={(e) => onChange("job_title", e.target.value)}
            placeholder="e.g., Customer Service Representative"
            className={errors.job_title ? errorInputClasses : inputClasses}
          />
          <FieldError message={errors.job_title} />
        </div>

        {/* Category & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <SelectField
            id="job_category"
            label="Category"
            value={formData.job_category}
            onChange={(v) => onChange("job_category", v)}
            options={JOB_CATEGORIES}
            placeholder="Select a category"
            required
            error={errors.job_category}
          />
          <SelectField
            id="job_type"
            label="Job Type"
            value={formData.job_type}
            onChange={(v) => onChange("job_type", v)}
            options={JOB_TYPES}
            placeholder="Select type"
          />
        </div>

        {/* Work Arrangement */}
        <SelectField
          id="work_arrangement"
          label="Work Arrangement"
          value={formData.work_arrangement}
          onChange={(v) => onChange("work_arrangement", v)}
          options={WORK_ARRANGEMENTS}
          placeholder="Select work arrangement"
        />

        {/* Country → Province/State → City */}
        <LocationFields
          country={formData.country}
          stateProvince={formData.state_province}
          city={formData.city}
          onChange={onChange}
          cityRequired
          cityError={errors.city}
        />

        {/* Salary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <FieldLabel htmlFor="salary_min" required>
              Salary (min)
            </FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                id="salary_min"
                type="number"
                min="0"
                value={formData.salary_min}
                onChange={(e) => onChange("salary_min", e.target.value)}
                className={`${errors.salary_min ? "border-red-500" : "border-gray-200"} w-full pl-7 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white`}
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="salary_max">Salary (max)</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                id="salary_max"
                type="number"
                min="0"
                value={formData.salary_max}
                onChange={(e) => onChange("salary_max", e.target.value)}
                className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
              />
            </div>
          </div>
          <SelectField
            id="currency"
            label="Currency"
            value={formData.currency}
            onChange={(v) => onChange("currency", v)}
            options={CURRENCIES}
            placeholder="Currency"
          />
        </div>
        <FieldError message={errors.salary_min} />

        {/* Brief */}
        <div>
          <FieldLabel htmlFor="description" required>
            Job Brief
          </FieldLabel>
          <RichTextEditor
            id="description"
            value={formData.description}
            onChange={(html) => onChange("description", html)}
            placeholder="What is this role, and what will they do day to day?"
            hasError={Boolean(errors.description)}
            ariaLabel="Job brief"
          />
          <FieldError message={errors.description} />
        </div>

        {/* Responsibilities */}
        <div>
          <FieldLabel htmlFor="responsibilities" required>
            What You&apos;ll Do
          </FieldLabel>
          <HelperText>List the main responsibilities — one per line.</HelperText>
          <textarea
            id="responsibilities"
            value={formData.responsibilities}
            onChange={(e) => onChange("responsibilities", e.target.value)}
            rows={5}
            placeholder={
              "Greet and assist customers\nOperate the point-of-sale system\nKeep the work area clean and stocked"
            }
            className={`mt-1.5 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none ${
              errors.responsibilities ? "border-red-500" : "border-gray-200"
            }`}
          />
          <FieldError message={errors.responsibilities} />
        </div>
      </div>
    </div>
  );
}

function StepReview({ formData }: { formData: JobFormData }) {
  // The brief is HTML; show plain text in the compact preview.
  const plainDescription = formData.description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const formatSalary = () => {
    if (!formData.salary_min && !formData.salary_max) return "Not specified";
    if (formData.salary_min && formData.salary_max) {
      return `$${Number(formData.salary_min).toLocaleString()} – $${Number(formData.salary_max).toLocaleString()}`;
    }
    if (formData.salary_min)
      return `From $${Number(formData.salary_min).toLocaleString()}`;
    return `Up to $${Number(formData.salary_max).toLocaleString()}`;
  };

  const displayLocation = [
    formData.city,
    regionName(formData.country, formData.state_province),
    formData.country,
  ]
    .filter(Boolean)
    .join(", ");

  const displayJobType = JOB_TYPES.find(
    (t) => t.value === formData.job_type,
  )?.label;
  const displayArrangement = WORK_ARRANGEMENTS.find(
    (t) => t.value === formData.work_arrangement,
  )?.label;
  const displayCategory = JOB_CATEGORIES.find(
    (c) => c.value === formData.job_category,
  )?.label;
  const displaySchedule = WORK_SCHEDULES.find(
    (ws) => ws.value === formData.work_schedule,
  )?.label;
  const displayExperience = EXPERIENCE_LEVELS.find(
    (l) => l.value === formData.experience_level,
  )?.label;

  // Summary checklist
  const summaryItems = [
    {
      label: "Title",
      value: formData.job_title,
    },
    {
      label: "Category",
      value: displayCategory,
    },
    {
      label: "Type",
      value: displayJobType,
    },
    {
      label: "Salary",
      value: formData.salary_min || formData.salary_max ? formatSalary() : "",
    },
    {
      label: "Location",
      value: displayLocation,
    },
    {
      label: "Experience",
      value: displayExperience,
    },
  ];

  const missingRequired =
    !formData.job_title ||
    !formData.job_category ||
    !formData.city ||
    (!formData.salary_min && !formData.salary_max) ||
    !plainDescription ||
    !formData.responsibilities.trim();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Review Your Job Listing
      </h2>
      <p className="text-sm md:text-base text-gray-500 mb-6">
        Review all the details before submitting. This is how candidates will
        see your posting.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        {/* Left — Preview card */}
        <div className="lg:col-span-3 border border-gray-200 rounded-xl p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg md:text-2xl font-bold text-gray-900">
              {formData.job_title || "Job Title"}
            </h3>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              Preview
            </span>
          </div>
          <p className="text-sm md:text-base text-gray-500 mb-3">
            {displayCategory || "Category"}
          </p>

          {/* Tags row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-5">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {displayJobType || "Not specified"}
              {displayArrangement ? ` · ${displayArrangement}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {formData.salary_min || formData.salary_max
                ? formatSalary()
                : "Not specified"}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {displaySchedule || "Schedule"}
            </span>
          </div>

          {/* About this role */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              About this role
            </h4>
            <p className="text-sm md:text-base text-gray-500 leading-relaxed">
              {plainDescription
                ? plainDescription.slice(0, 300) +
                  (plainDescription.length > 300 ? "..." : "")
                : "No description provided."}
            </p>
          </div>

          {/* Requirements */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Requirements
            </h4>
            <div className="space-y-1">
              <p className="text-sm md:text-base text-gray-500">
                <span className="font-medium text-gray-600">
                  Experience Level:
                </span>{" "}
                {displayExperience || "Not specified"}
              </p>
              {formData.skills && (
                <p className="text-sm md:text-base text-gray-500">
                  <span className="font-medium text-gray-600">
                    Required Skills:
                  </span>{" "}
                  {formData.skills}
                </p>
              )}
              {formData.physical_demands && (
                <p className="text-sm md:text-base text-gray-500">
                  <span className="font-medium text-gray-600">
                    Physical Demands:
                  </span>{" "}
                  {PHYSICAL_DEMANDS.find((d) => d.value === formData.physical_demands)?.label || formData.physical_demands}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right — Summary checklist */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">
              Summary
            </h3>
            <div className="space-y-3">
              {summaryItems.map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      item.value
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    {item.value && (
                      <HiCheck className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-medium text-gray-700">
                      {item.label}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400">
                      {item.value || "Not specified"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Required fields warning */}
            {missingRequired && (
              <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 leading-relaxed">
                  Please complete the required fields (Title, Category,
                  Location, Salary, Job Brief and What You&apos;ll Do) before
                  submitting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The wizard's progress rail: a vertical, numbered stepper in Vetriconn red.
 * Completed steps show a check and can be clicked to jump back; the current
 * step is marked with aria-current. It sits in a left rail on large screens
 * and stacks above the form on small ones, so it stays single-column-friendly
 * and legible at scaled text / high contrast.
 */
function VerticalStepper({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: readonly { number: number; label: string }[];
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <nav aria-label="Progress">
      <ol className="relative">
        {steps.map((step, i) => {
          const isComplete = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isLast = i === steps.length - 1;
          const clickable = isComplete;
          return (
            <li key={step.number} className="relative flex pb-4 last:pb-0">
              {/* Vertical connector to the next step */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-4 top-9 -ml-px h-[calc(100%-1.5rem)] w-0.5 ${
                    isComplete ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => clickable && onStepClick(step.number)}
                disabled={!clickable}
                aria-current={isCurrent ? "step" : undefined}
                className={`group flex items-center gap-3 text-left ${
                  clickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isComplete
                      ? "bg-primary text-white group-hover:bg-primary-hover"
                      : isCurrent
                        ? "bg-primary text-white ring-4 ring-red-100"
                        : "border-2 border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {isComplete ? <HiCheck className="h-4 w-4" /> : step.number}
                </span>
                <span className="min-h-[44px] flex flex-col justify-center py-1">
                  <span
                    className={`text-sm font-medium ${
                      isCurrent
                        ? "text-gray-900"
                        : isComplete
                          ? "text-gray-700 group-hover:text-primary"
                          : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {isComplete ? "Completed" : isCurrent ? "In progress" : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Main Wizard Component ───────────────────────────────────────────────────

const CreateJobPosting = ({
  variant = "full",
}: {
  /** "lite" is the 2-step quick-post path; "full" is the complete builder. */
  variant?: "full" | "lite";
} = {}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToaster();
  const { userProfile } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [builderMode, setBuilderMode] = useState<"full" | "lite">(variant);
  const [formData, setFormData] = useState<JobFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string>("");

  const steps = builderMode === "lite" ? LITE_STEPS : WIZARD_STEPS;
  const totalSteps = steps.length;
  const draftId = searchParams.get("draftId");

  // Switch between quick-post and the full builder. Form data is a superset, so
  // nothing is lost either way; we just reset to the first step.
  const switchMode = useCallback((next: "full" | "lite") => {
    setBuilderMode(next);
    setCurrentStep(1);
    setErrors({});
  }, []);

  // Pin the header just below the sticky dashboard navbar, and the stepper just
  // below the header — measured at runtime so the offsets stay correct whatever
  // the navbar/header heights are (responsive text, wrapping, or accessibility
  // text-scaling), instead of relying on a brittle magic number.
  const headerRef = useRef<HTMLDivElement>(null);
  const [stickyTops, setStickyTops] = useState({ header: 64, rail: 140 });
  useEffect(() => {
    const nav = document.querySelector("nav.sticky") as HTMLElement | null;
    const measure = () => {
      const navH = nav?.offsetHeight ?? 64;
      const headerH = headerRef.current?.offsetHeight ?? 76;
      setStickyTops({ header: navH, rail: navH + headerH });
    };
    measure();
    // ResizeObserver catches font-load, wrapping and text-scaling changes that
    // a plain resize listener would miss.
    const ro = new ResizeObserver(measure);
    if (nav) ro.observe(nav);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [builderMode, currentStep]);

  // Straight column reads. This used to reverse-engineer the form state by
  // scanning tags/qualifications/responsibilities against the dropdown option
  // lists — guesswork that misfiled values whenever two lists shared a slug.
  const mapJobToFormData = useCallback(
    (job: PostedJobDetail): JobFormData => ({
      job_title: job.role || "",
      job_category: job.job_category ?? "",
      job_type: job.job_type ?? "",
      work_arrangement: job.work_arrangement ?? "",
      description: job.full_description || job.description || "",
      responsibilities: (job.responsibilities ?? []).join("\n"),
      requirements: (job.qualifications ?? []).join("\n"),
      experience_level: job.experience_level ?? "",
      skills: job.skills ?? "",
      physical_demands: job.physical_demands ?? "",
      // Zero means "not specified" in storage, so it comes back as empty
      // rather than as a claim the job pays nothing.
      salary_min: job.salary_range?.start_salary?.number
        ? String(job.salary_range.start_salary.number)
        : job.salary?.number
          ? String(job.salary.number)
          : "",
      salary_max: job.salary_range?.end_salary?.number
        ? String(job.salary_range.end_salary.number)
        : "",
      payment_type: job.payment_type ?? "",
      currency: job.currency ?? "CAD",
      city: job.city ?? "",
      state_province: job.state_province ?? "",
      country: job.country ?? "Canada",
      work_schedule: job.work_schedule ?? "",
      min_qualification: job.min_qualification ?? "",
      security_clearance: job.security_clearance ?? "",
      requires_drivers_license: job.requires_drivers_license ?? false,
      visa_sponsorship: job.visa_sponsorship ?? false,
      veteran_friendly: job.veteran_friendly ?? false,
      accommodations_offered: job.accommodations_offered ?? false,
      physically_accessible: job.physically_accessible ?? false,
      open_to_returners: job.open_to_returners ?? false,
      languages: job.languages ?? [],
      benefits: job.benefits ?? [],
      certifications: (job.certifications ?? []).join(", "),
      openings: job.openings ? String(job.openings) : "",
      application_deadline: job.application_deadline ?? "",
      start_date: job.start_date ?? "",
      screening_questions: job.screening_questions ?? [],
      faqs: job.faqs ?? [],
      hiring_stages: job.hiring_stages ?? [],
    }),
    [],
  );

  React.useEffect(() => {
    if (!draftId) return;

    let active = true;
    setIsDraftLoading(true);

    void getMyPosting(draftId)
      .then((job) => {
        if (!active) return;
        setEditingJobId(job._id);
        setFormData(mapJobToFormData(job));
      })
      .catch((err) => {
        if (!active) return;
        // Invalid draft ID - remove it from URL and proceed with new job creation
        console.warn("Invalid draft ID, proceeding with new job creation:", err);
        const url = new URL(window.location.href);
        url.searchParams.delete("draftId");
        window.history.replaceState({}, "", url.toString());
        // Don't show error toast - just silently proceed with new creation
      })
      .finally(() => {
        if (active) setIsDraftLoading(false);
      });

    return () => {
      active = false;
    };
  }, [draftId, mapJobToFormData]);

  const handleFieldChange = useCallback(
    (field: keyof JobFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors],
  );

  // Generic setter for the non-string fields — booleans and multi-selects.
  const setField = useCallback(
    <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Toggle a value in a multi-select array field (languages, benefits).
  const toggleInArray = useCallback(
    (field: "languages" | "benefits", value: string) => {
      setFormData((prev) => {
        const current = prev[field];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [field]: next };
      });
    },
    [],
  );

  const validateStep = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    const briefEmpty = !formData.description.replace(/<[^>]*>/g, "").trim();
    const salaryValid = () => {
      if (!formData.salary_min && !formData.salary_max) {
        newErrors.salary_min = "Add a salary or range";
      } else if (
        formData.salary_min &&
        formData.salary_max &&
        Number(formData.salary_min) > Number(formData.salary_max)
      ) {
        newErrors.salary_min = "Minimum salary cannot exceed maximum";
      }
    };

    // Lite: everything required lives on the single Essentials step.
    if (builderMode === "lite") {
      if (currentStep === 1) {
        if (!formData.job_title.trim())
          newErrors.job_title = "Job title is required";
        if (!formData.job_category)
          newErrors.job_category = "Category is required";
        if (!formData.city.trim())
          newErrors.city = "Location (city) is required";
        salaryValid();
        if (briefEmpty) newErrors.description = "A job brief is required";
        if (!formData.responsibilities.trim())
          newErrors.responsibilities = "Add at least one responsibility";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (currentStep === 1) {
      if (!formData.job_title.trim()) {
        newErrors.job_title = "Job title is required";
      }
      if (!formData.job_category) {
        newErrors.job_category = "Category is required";
      }
    }

    if (currentStep === 2) {
      // The brief is HTML now, so an empty editor can still hold "<br>";
      // require real text, not just tags.
      if (briefEmpty) {
        newErrors.description = "A job brief is required";
      }
      if (!formData.responsibilities.trim()) {
        newErrors.responsibilities = "Add at least one responsibility";
      }
    }

    if (currentStep === 4) {
      if (!formData.city.trim()) {
        newErrors.city = "Location (city) is required";
      }
      salaryValid();
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [builderMode, currentStep, formData]);

  const handleContinue = useCallback(() => {
    if (!validateStep()) return;

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, totalSteps, validateStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // Jump straight to an already-completed step from the stepper. Only backward
  // jumps are allowed, so we never skip a step's validation on the way forward.
  const goToStep = useCallback(
    (step: number) => {
      if (step < currentStep) {
        setCurrentStep(step);
        setErrors({});
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentStep],
  );

  // Empty means posting as the individual employer, which is the default and
  // the only option for anyone without an approved Company Page.
  const [postAsCompanyId, setPostAsCompanyId] = useState("");
  const { approvedCompanies } = useMyCompanies();

  // Companies this user may post under: approved, and they're an owner/admin.
  // Recruiters can review applicants but not create postings, matching the
  // server's check — so the control simply won't list those companies.
  const postableCompanies = approvedCompanies.filter((company) =>
    canPostJobsFor(company, userProfile?.id),
  );

  // Typed against the wire contract. The old payload also sent tags,
  // qualifications, responsibilities, salary_range and a draft_payload blob —
  // all silently stripped by the backend validator; the flat fields below are
  // what actually crosses, now as vocabulary-checked columns.
  const buildPayload = useCallback(
    (status: "draft" | "published"): CreateJobInput => ({
      role: formData.job_title,
      description: formData.description,
      responsibilities: linesToList(formData.responsibilities),
      qualifications: linesToList(formData.requirements),
      skills: formData.skills,
      experience_level: asVocab(
        EXPERIENCE_LEVEL_VALUES,
        formData.experience_level,
      ),
      physical_demands: asVocab(
        PHYSICAL_DEMAND_VALUES,
        formData.physical_demands,
      ),
      salary_min: formData.salary_min,
      salary_max: formData.salary_max,
      payment_type: asVocab(PAYMENT_TYPE_VALUES, formData.payment_type),
      city: formData.city,
      state_province: formData.state_province || undefined,
      country: formData.country,
      work_schedule: asVocab(WORK_SCHEDULE_VALUES, formData.work_schedule),
      work_arrangement: asVocab(
        WORK_ARRANGEMENT_VALUES,
        formData.work_arrangement,
      ),
      job_type: asVocab(JOB_TYPE_VALUES, formData.job_type),
      job_category: asVocab(INDUSTRIES, formData.job_category),
      // Phase-1 job-builder fields.
      currency: asVocab(CURRENCY_VALUES, formData.currency),
      min_qualification: asVocab(
        MIN_QUALIFICATION_VALUES,
        formData.min_qualification,
      ),
      security_clearance: asVocab(
        SECURITY_CLEARANCE_VALUES,
        formData.security_clearance,
      ),
      requires_drivers_license: formData.requires_drivers_license,
      visa_sponsorship: formData.visa_sponsorship,
      veteran_friendly: formData.veteran_friendly,
      accommodations_offered: formData.accommodations_offered,
      physically_accessible: formData.physically_accessible,
      open_to_returners: formData.open_to_returners,
      languages: formData.languages.filter((l): l is (typeof LANGUAGE_VALUES)[number] =>
        (LANGUAGE_VALUES as readonly string[]).includes(l),
      ),
      benefits: formData.benefits.filter((b): b is (typeof BENEFIT_VALUES)[number] =>
        (BENEFIT_VALUES as readonly string[]).includes(b),
      ),
      certifications: formData.certifications
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      openings: formData.openings ? Number(formData.openings) : undefined,
      application_deadline: formData.application_deadline || undefined,
      start_date: formData.start_date || undefined,
      // Phase-2 fields, cleaned: drop blank rows and trim, so an empty editor
      // row never reaches the server (which would reject it) or a listing.
      screening_questions: cleanScreeningQuestions(formData.screening_questions),
      faqs: cleanFaqs(formData.faqs),
      hiring_stages: cleanStages(formData.hiring_stages),
      status,
      // Empty means posting as the individual employer.
      company_id: postAsCompanyId || undefined,
    }),
    [formData, postAsCompanyId],
  );

  const handleSaveDraft = useCallback(async () => {
    if (!formData.job_title.trim()) {
      setErrors((prev) => ({
        ...prev,
        job_title: "Job title is required to save a draft",
      }));
      setCurrentStep(1);
      return;
    }

    setIsSaving(true);
    try {
      if (editingJobId) {
        await updatePosting(editingJobId, buildPayload("draft"));
        showToast({
          type: "success",
          title: "Draft updated",
          description: "Your job draft was updated successfully",
        });
      } else {
        const newJob = await createPosting(buildPayload("draft"));
        // Set the editing ID so subsequent saves update instead of creating new drafts
        setEditingJobId(newJob._id);
        // Update URL to include draftId
        const url = new URL(window.location.href);
        url.searchParams.set("draftId", newJob._id);
        window.history.replaceState({}, "", url.toString());
        showToast({
          type: "success",
          title: "Draft saved",
          description: "Your job draft was saved successfully",
        });
      }
      await mutate("employer-jobs-dashboard");
      await mutate("employer-jobs-manage");
      await mutate("employer-jobs-drafts");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save draft";
      showToast({
        type: "error",
        title: "Could not save draft",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [buildPayload, editingJobId, formData.job_title, showToast]);

  const handlePublish = useCallback(async () => {
    if (!validateStep()) return;

    setIsSaving(true);
    try {
      if (editingJobId) {
        await updatePosting(editingJobId, buildPayload("published"));
      } else {
        await createPosting(buildPayload("published"));
      }
      await mutate("employer-jobs-dashboard");
      await mutate("employer-jobs-manage");
      await mutate("employer-jobs-drafts");
      showToast({
        type: "success",
        title: "Job published",
        description: "Your job is now live",
      });
      router.push("/dashboard/postings");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish";
      showToast({
        type: "error",
        title: "Publish failed",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [buildPayload, editingJobId, router, showToast, validateStep]);

  // ─── Render Current Step ─────────────────────────────────────────────────

  const renderStep = () => {
    // Lite quick-post: one Essentials step, then the shared Preview.
    if (builderMode === "lite") {
      return currentStep === 1 ? (
        <StepEssentials
          formData={formData}
          errors={errors}
          onChange={handleFieldChange}
        />
      ) : (
        <StepReview formData={formData} />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <StepJobDetails
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
          />
        );
      case 2:
        return (
          <StepDescription
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
          />
        );
      case 3:
        return (
          <StepRequirements
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
            onSet={setField}
            onToggle={toggleInArray}
          />
        );
      case 4:
        return (
          <StepSalaryLocation
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
            onToggle={toggleInArray}
          />
        );
      case 5:
        return (
          <StepHiring
            questions={formData.screening_questions}
            faqs={formData.faqs}
            stages={formData.hiring_stages}
            setQuestions={(q) => setField("screening_questions", q)}
            setFaqs={(f) => setField("faqs", f)}
            setStages={(s) => setField("hiring_stages", s)}
          />
        );
      case 6:
        return <StepReview formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-6 py-8 max-w-full lg:max-w-6xl xl:max-w-7xl">
        {/* Header */}
        {/* Header — pinned below the sticky dashboard navbar so the title, step
            counter and mode toggle stay visible while only the form scrolls.
            The top offset is measured (stickyTops.header); sticky only on lg+,
            on mobile it scrolls normally (top is ignored while static). */}
        <div
          ref={headerRef}
          style={{ top: stickyTops.header }}
          className="flex items-center justify-between mb-8 lg:mb-0 lg:sticky lg:z-30 lg:-mx-6 lg:px-6 lg:pt-2 lg:pb-8 lg:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-primary rounded-full flex items-center justify-center">
              <HiOutlineBriefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                {editingJobId ? "Continue Draft" : "Create Job Posting"}
              </h1>
              <p className="text-xs md:text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Quick-post ⇄ full builder. Data is shared, so switching is safe. */}
            {!editingJobId && (
              <div
                role="group"
                aria-label="Posting mode"
                className="hidden sm:inline-flex rounded-lg border border-gray-200 bg-white p-1"
              >
                {(
                  [
                    ["lite", "Quick post"],
                    ["full", "Full builder"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => switchMode(mode)}
                    aria-pressed={builderMode === mode}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      builderMode === mode
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Two-column layout: vertical stepper rail + form content */}
        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          {/* Left rail — vertical stepper. Sticky on the grid item itself with
              self-start (the reliable grid pattern), pinned just below the
              sticky header (measured stickyTops.rail) so the steps stay put
              while only the form scrolls. */}
          <div
            style={{ top: stickyTops.rail }}
            className="mb-8 lg:mb-0 lg:sticky lg:self-start"
          >
            <VerticalStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={goToStep}
            />
          </div>

          {/* Right column — step content + actions */}
          <div>
        {/* Quick-post nudge: the full builder's richer data drives visibility
            and matching, so encourage it (posting as a company most of all). */}
        {builderMode === "lite" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-red-50 p-4">
            <HiOutlineBriefcase className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Want more visibility and better matches?</span>{" "}
              Posting as a company with the full builder captures the details
              that power candidate matching.{" "}
              <button
                type="button"
                onClick={() => switchMode("full")}
                className="font-semibold text-primary underline underline-offset-2 hover:text-primary-hover"
              >
                Switch to the full builder
              </button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
          {/* Only shown when there's genuinely a choice to make — solo
              employers see the form exactly as before. */}
          {postableCompanies.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <SelectField
                id="post_as"
                label="Post as"
                value={postAsCompanyId}
                onChange={setPostAsCompanyId}
                placeholder={`${userProfile?.full_name || "Myself"} (individual)`}
                options={[
                  {
                    value: "",
                    label: `${userProfile?.full_name || "Myself"} (individual)`,
                  },
                  ...postableCompanies.map((company) => ({
                    value: company._id,
                    label: company.name,
                  })),
                ]}
                helperText={
                  postAsCompanyId
                    ? "This posting and its applicants belong to the company, and your teammates can manage them."
                    : "This posting belongs to you personally."
                }
              />
            </div>
          )}

          {isDraftLoading ? (
            <div className="text-sm text-gray-500">Loading draft...</div>
          ) : (
            renderStep()
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <HiOutlineClipboardDocument className="w-4 h-4" />
            Save as Draft
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <HiOutlineArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Continue
                <HiOutlineArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {isSaving ? "Publishing..." : "Publish Job"}
                {!isSaving && <HiOutlineArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJobPosting;

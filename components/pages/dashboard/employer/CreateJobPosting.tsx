"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
  HiOutlineBriefcase,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineClipboardDocument,
  HiCheck,
} from "react-icons/hi2";

// ─── Constants ───────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { number: 1, label: "Job Details" },
  { number: 2, label: "Description" },
  { number: 3, label: "Requirements" },
  { number: 4, label: "Salary & Location" },
  { number: 5, label: "Review" },
];

const JOB_CATEGORIES = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "customer-service", label: "Customer Service" },
  { value: "finance", label: "Finance & Accounting" },
  { value: "hr", label: "Human Resources" },
  { value: "operations", label: "Operations" },
  { value: "product", label: "Product Management" },
  { value: "data", label: "Data & Analytics" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "legal", label: "Legal" },
  { value: "admin", label: "Administrative" },
  { value: "other", label: "Other" },
];

const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "internship", label: "Internship" },
];

const EMPLOYMENT_TYPES = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "lead", label: "Lead" },
  { value: "executive", label: "Executive" },
];

const PHYSICAL_DEMANDS = [
  { value: "none", label: "No physical demands" },
  { value: "light", label: "Light — mostly seated or standing" },
  { value: "moderate", label: "Moderate — some lifting or movement" },
  { value: "heavy", label: "Heavy — regular physical activity" },
  { value: "flexible-hours", label: "Flexible hours available" },
  { value: "shift-work", label: "Shift work required" },
  { value: "standard-hours", label: "Standard business hours" },
];

const PAYMENT_TYPES = [
  { value: "salary", label: "Annual Salary" },
  { value: "hourly", label: "Hourly Rate" },
  { value: "commission", label: "Commission-based" },
  { value: "stipend", label: "Stipend" },
  { value: "volunteer", label: "Volunteer / Unpaid" },
];

const WORK_SCHEDULES = [
  { value: "full-time", label: "Full-time (40 hrs/week)" },
  { value: "part-time", label: "Part-time" },
  { value: "flexible", label: "Flexible hours" },
  { value: "shift-based", label: "Shift-based" },
  { value: "weekdays", label: "Weekdays only" },
  { value: "weekends", label: "Includes weekends" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface JobFormData {
  // Step 1 — Job Details
  job_title: string;
  job_category: string;
  job_type: string;
  employment_type: string;

  // Step 2 — Description
  description: string;

  // Step 3 — Requirements & Experience
  experience_level: string;
  skills: string;
  physical_demands: string;

  // Step 4 — Salary & Location
  salary_min: string;
  salary_max: string;
  payment_type: string;
  city: string;
  country: string;
  work_schedule: string;
}

interface FormErrors {
  [key: string]: string;
}

const INITIAL_FORM_DATA: JobFormData = {
  job_title: "",
  job_category: "",
  job_type: "",
  employment_type: "",
  description: "",
  experience_level: "",
  skills: "",
  physical_demands: "",
  salary_min: "",
  salary_max: "",
  payment_type: "",
  city: "",
  country: "",
  work_schedule: "",
};

// ─── Shared UI Helpers ───────────────────────────────────────────────────────

const inputClasses =
  "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white";

const selectClasses =
  "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white appearance-none cursor-pointer";

const errorInputClasses =
  "w-full px-4 py-2.5 border border-red-500 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white";

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
      className="block text-sm font-medium text-gray-700 mb-1.5"
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-400 mt-1">{children}</p>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
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
      <p className="text-sm text-gray-500 mb-6">
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
        <div>
          <FieldLabel htmlFor="job_category">Job Category</FieldLabel>
          <select
            id="job_category"
            value={formData.job_category}
            onChange={(e) => onChange("job_category", e.target.value)}
            className={selectClasses}
          >
            <option value="">Select a category</option>
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Job Type & Employment Type — side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="job_type">Job Type</FieldLabel>
            <select
              id="job_type"
              value={formData.job_type}
              onChange={(e) => onChange("job_type", e.target.value)}
              className={selectClasses}
            >
              <option value="">Select type</option>
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="employment_type">Employment Type</FieldLabel>
            <select
              id="employment_type"
              value={formData.employment_type}
              onChange={(e) => onChange("employment_type", e.target.value)}
              className={selectClasses}
            >
              <option value="">Select employment type</option>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
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
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Job Details</h2>
      <p className="text-sm text-gray-500 mb-6">
        Explain the role simply and honestly to help candidates understand what
        to expect.
      </p>

      <textarea
        id="description"
        value={formData.description}
        onChange={(e) => onChange("description", e.target.value)}
        rows={10}
        maxLength={5000}
        className={`${errors.description ? "border-red-500" : "border-gray-200"} w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none`}
      />
      <FieldError message={errors.description} />
    </div>
  );
}

function StepRequirements({
  formData,
  onChange,
}: {
  formData: JobFormData;
  errors: FormErrors;
  onChange: (field: keyof JobFormData, value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Requirements &amp; Experience
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Set realistic expectations for veterans and retirees.
      </p>

      <div className="space-y-5">
        {/* Experience Level */}
        <div>
          <FieldLabel htmlFor="experience_level">Experience Level</FieldLabel>
          <select
            id="experience_level"
            value={formData.experience_level}
            onChange={(e) => onChange("experience_level", e.target.value)}
            className={selectClasses}
          >
            <option value="">Select experience Level</option>
            {EXPERIENCE_LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>
                {lvl.label}
              </option>
            ))}
          </select>
        </div>

        {/* Required Skills */}
        <div>
          <FieldLabel htmlFor="skills">Required Skills</FieldLabel>
          <HelperText>
            Select the skills that are essential for this role.
          </HelperText>
          <textarea
            id="skills"
            value={formData.skills}
            onChange={(e) => onChange("skills", e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none mt-1.5"
          />
        </div>

        {/* Physical or Time Demands */}
        <div>
          <FieldLabel htmlFor="physical_demands">
            Physical or Time Demands (Optional)
          </FieldLabel>
          <select
            id="physical_demands"
            value={formData.physical_demands}
            onChange={(e) => onChange("physical_demands", e.target.value)}
            className={selectClasses}
          >
            <option value="">Select experience Level</option>
            {PHYSICAL_DEMANDS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function StepSalaryLocation({
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
        Salary &amp; Location
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Be transparent about compensation and location to reduce uncertainty for
        applicants.
      </p>

      <div className="space-y-5">
        {/* Minimum / Maximum */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Payment Type */}
        <div>
          <FieldLabel htmlFor="payment_type">Payment Type</FieldLabel>
          <select
            id="payment_type"
            value={formData.payment_type}
            onChange={(e) => onChange("payment_type", e.target.value)}
            className={selectClasses}
          >
            <option value="">Select payment type</option>
            {PAYMENT_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>
                {pt.label}
              </option>
            ))}
          </select>
        </div>

        {/* City / Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="e.g New york"
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <input
              id="country"
              type="text"
              value={formData.country}
              onChange={(e) => onChange("country", e.target.value)}
              placeholder="e.g United states"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Work Schedule */}
        <div>
          <FieldLabel htmlFor="work_schedule">Work Schedule</FieldLabel>
          <select
            id="work_schedule"
            value={formData.work_schedule}
            onChange={(e) => onChange("work_schedule", e.target.value)}
            className={selectClasses}
          >
            <option value="">Select schedule type</option>
            {WORK_SCHEDULES.map((ws) => (
              <option key={ws.value} value={ws.value}>
                {ws.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function StepReview({ formData }: { formData: JobFormData }) {
  const formatSalary = () => {
    if (!formData.salary_min && !formData.salary_max) return "Not specified";
    if (formData.salary_min && formData.salary_max) {
      return `$${Number(formData.salary_min).toLocaleString()} – $${Number(formData.salary_max).toLocaleString()}`;
    }
    if (formData.salary_min)
      return `From $${Number(formData.salary_min).toLocaleString()}`;
    return `Up to $${Number(formData.salary_max).toLocaleString()}`;
  };

  const displayLocation = [formData.city, formData.country]
    .filter(Boolean)
    .join(", ");

  const displayJobType = JOB_TYPES.find(
    (t) => t.value === formData.job_type,
  )?.label;
  const displayEmploymentType = EMPLOYMENT_TYPES.find(
    (t) => t.value === formData.employment_type,
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
    !formData.job_title || !formData.job_category || !formData.description;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Review Your Job Listing
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Review all the details before submitting. This is how candidates will
        see your posting.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left — Preview card */}
        <div className="lg:col-span-3 border border-gray-200 rounded-xl p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-gray-900">
              {formData.job_title || "Job Title"}
            </h3>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              Preview
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            {displayCategory || "Category"}
          </p>

          {/* Tags row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-5">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {displayJobType || "Not specified"}
              {displayEmploymentType ? ` · ${displayEmploymentType}` : ""}
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
            <p className="text-sm text-gray-500 leading-relaxed">
              {formData.description
                ? formData.description.slice(0, 300) +
                  (formData.description.length > 300 ? "..." : "")
                : "No description provided."}
            </p>
          </div>

          {/* Requirements */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Requirements
            </h4>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-600">
                Experience Level:
              </span>{" "}
              {displayExperience || "Not specified"}
            </p>
          </div>
        </div>

        {/* Right — Summary checklist */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
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
                    <p className="text-sm font-medium text-gray-700">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-400">
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
                  Description) before submitting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Wizard Component ───────────────────────────────────────────────────

const CreateJobPosting = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = WIZARD_STEPS.length;

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

  const validateStep = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.job_title.trim()) {
        newErrors.job_title = "Job title is required";
      }
    }

    if (currentStep === 2) {
      if (!formData.description.trim()) {
        newErrors.description = "Job description is required";
      }
    }

    if (currentStep === 4) {
      if (
        formData.salary_min &&
        formData.salary_max &&
        Number(formData.salary_min) > Number(formData.salary_max)
      ) {
        newErrors.salary_min = "Minimum salary cannot exceed maximum";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData]);

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

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      // TODO: Wire up to backend API
      await new Promise((r) => setTimeout(r, 600));
    } catch {
      // Error handling with real API
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handlePublish = useCallback(async () => {
    setIsSaving(true);
    try {
      // TODO: Wire up to backend API
      await new Promise((r) => setTimeout(r, 800));
    } catch {
      // Error handling with real API
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ─── Render Current Step ─────────────────────────────────────────────────

  const renderStep = () => {
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
          />
        );
      case 4:
        return (
          <StepSalaryLocation
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
          />
        );
      case 5:
        return <StepReview formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`mx-auto px-6 py-8 ${currentStep === 5 ? "max-w-[780px]" : "max-w-[560px]"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-primary rounded-full flex items-center justify-center">
              <HiOutlineBriefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Create Job Posting
              </h1>
              <p className="text-xs text-gray-500">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {WIZARD_STEPS.map((step, i) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step.number === currentStep
                      ? "bg-primary text-white"
                      : step.number < currentStep
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.number < currentStep ? (
                    <HiCheck className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    step.number <= currentStep
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-2 sm:mx-3 ${
                    step.number < currentStep ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          {renderStep()}
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
  );
};

export default CreateJobPosting;

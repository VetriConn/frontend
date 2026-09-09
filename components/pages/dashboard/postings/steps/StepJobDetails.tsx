"use client";

import React from "react";
import {
  FieldLabel,
  FieldError,
  HelperText,
  SelectField,
  inputClasses,
  errorInputClasses,
} from "../formKit";
import {
  JOB_CATEGORIES,
  JOB_TYPES,
  WORK_ARRANGEMENTS,
  type JobFormData,
  type FormErrors,
} from "../jobForm";

// ─── Step Components ─────────────────────────────────────────────────────────
export function StepJobDetails({
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
      <p className="text-sm md:text-base text-gray-600 mb-6">
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

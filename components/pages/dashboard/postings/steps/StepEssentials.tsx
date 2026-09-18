"use client";

import {
  FieldError,
  SelectField,
  LocationFields,
} from "@/components/ui/formKit";
import {
  StepHeading,
  JobTitleField,
  SalaryAmountField,
  JobBriefField,
  ResponsibilitiesField,
  type StepProps,
} from "./stepKit";
import {
  JOB_CATEGORIES,
  JOB_TYPES,
  WORK_ARRANGEMENTS,
  CURRENCIES,
} from "../jobForm";

export function StepEssentials({ formData, errors, onChange }: StepProps) {
  return (
    <div>
      <StepHeading title="The essentials">
        Just the basics to get your job live. You can always edit it later.
      </StepHeading>

      <div className="space-y-5">
        {/* Title */}
        <JobTitleField
          value={formData.job_title}
          error={errors.job_title}
          onChange={onChange}
        />

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
          <SalaryAmountField
            id="salary_min"
            label="Salary (min)"
            value={formData.salary_min}
            onChange={onChange}
            required
            hasError={Boolean(errors.salary_min)}
          />
          <SalaryAmountField
            id="salary_max"
            label="Salary (max)"
            value={formData.salary_max}
            onChange={onChange}
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
        <FieldError message={errors.salary_min} />

        {/* Brief */}
        <div>
          <JobBriefField
            value={formData.description}
            onChange={onChange}
            error={errors.description}
          />
        </div>

        {/* Responsibilities */}
        <div>
          <ResponsibilitiesField
            value={formData.responsibilities}
            onChange={onChange}
            error={errors.responsibilities}
          />
        </div>
      </div>
    </div>
  );
}

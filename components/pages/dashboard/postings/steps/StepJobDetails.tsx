"use client";

import { SelectField } from "@/components/ui/formKit";
import { StepHeading, JobTitleField, type StepProps } from "./stepKit";
import { JOB_CATEGORIES, JOB_TYPES, WORK_ARRANGEMENTS } from "../jobForm";

// ─── Step Components ─────────────────────────────────────────────────────────
export function StepJobDetails({ formData, errors, onChange }: StepProps) {
  return (
    <div>
      <StepHeading title="Job Details">
        Define the basic identity of the job you&apos;re posting.
      </StepHeading>

      <div className="space-y-5">
        {/* Job Title */}
        <JobTitleField
          value={formData.job_title}
          error={errors.job_title}
          onChange={onChange}
          helperText="Use clear titles so older applicants can understand the role easily."
        />

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

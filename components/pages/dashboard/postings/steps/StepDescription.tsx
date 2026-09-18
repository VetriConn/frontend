"use client";

import { FieldLabel, HelperText } from "@/components/ui/formKit";
import {
  StepHeading,
  JobBriefField,
  ResponsibilitiesField,
  BulletTextarea,
  type StepProps,
} from "./stepKit";

export function StepDescription({ formData, errors, onChange }: StepProps) {
  return (
    <div>
      <StepHeading title="Job Description">
        Explain the role simply and honestly to help candidates understand what
        to expect. Use formatting to keep it scannable.
      </StepHeading>

      <JobBriefField
        value={formData.description}
        onChange={onChange}
        error={errors.description}
      />

      {/* What You'll Do — the section whose data used to get buried. */}
      <div className="mt-6">
        <ResponsibilitiesField
          value={formData.responsibilities}
          onChange={onChange}
          error={errors.responsibilities}
        />
      </div>

      {/* What We're Looking For — optional requirement bullets. */}
      <div className="mt-6">
        <FieldLabel htmlFor="requirements">What We&apos;re Looking For</FieldLabel>
        <HelperText>
          List key requirements or qualifications - one per line. Optional.
        </HelperText>
        <BulletTextarea
          id="requirements"
          value={formData.requirements}
          onChange={(v) => onChange("requirements", v)}
          rows={4}
          placeholder={
            "Comfortable on your feet for a full shift\nFriendly, reliable, and punctual\nRetail experience is a plus"
          }
        />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { SkillsInput } from "@/components/ui/SkillsInput";
import {
  FieldLabel,
  HelperText,
  SelectField,
  ChipGroup,
  ToggleRow,
  inputClasses,
} from "../formKit";
import {
  MIN_QUALIFICATIONS,
  SECURITY_CLEARANCES,
  LANGUAGES,
  PHYSICAL_DEMANDS,
  EXPERIENCE_LEVELS,
  splitSkills,
  type JobFormData,
  type FormErrors,
} from "../jobForm";
import { getSkillSuggestions } from "@/lib/api";

export function StepRequirements({
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
      <p className="text-sm md:text-base text-gray-600 mb-6">
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
            helperText="Many veterans already hold a clearance - flagging it helps matching."
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

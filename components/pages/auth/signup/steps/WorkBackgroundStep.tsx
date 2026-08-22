"use client";

import { StepProps } from "@/types/signup";
import { FormField } from "@/components/ui/FormField";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { EXPERIENCE_LEVELS, INDUSTRY_OPTIONS } from "@/lib/validation";
import { WizardNav } from "../WizardNav";
import { StepHeader } from "../StepHeader";

/**
 * Step 4: Work Background (Optional)
 * Collects user work experience details

 */
export const WorkBackgroundStep = ({
  formData,
  errors,
  onFieldChange,
  onNext,
  onBack,
  onSkip,
  currentStep,
  totalSteps,
}: StepProps) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <StepHeader
        title="Share your work experience"
        subtitle="This helps us find the right opportunities for you. You can always update this later."
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      {/* Form Fields */}
      <div className="space-y-2">
        <FormField
          label="Most Recent Job Title"
          name="job_title"
          type="text"
          placeholder="E.g., Registered Nurse, Retail manager"
          value={formData.job_title}
          onChange={(value) => onFieldChange("job_title", value)}
          error={errors.job_title}
        />

        <CustomDropdown
          label="Skill Area or Industry"
          name="industry"
          placeholder="Select your industry"
          helperText="What area do you have the most experience in?"
          value={formData.industry}
          onChange={(value) => onFieldChange("industry", value)}
          options={INDUSTRY_OPTIONS}
          error={errors.industry}
        />

        <CustomDropdown
          label="Years of Experience"
          name="years_of_experience"
          placeholder="Select your experience level"
          value={formData.years_of_experience}
          onChange={(value) => onFieldChange("years_of_experience", value)}
          options={EXPERIENCE_LEVELS}
          error={errors.years_of_experience}
        />
      </div>

      <WizardNav onBack={onBack} onNext={onNext} onSkip={onSkip} />
    </div>
  );
};

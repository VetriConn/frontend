"use client";

import { StepProps } from "@/types/signup";
import { FormField } from "@/components/ui/FormField";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { EXPERIENCE_LEVELS, INDUSTRY_OPTIONS } from "@/lib/validation";

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
}: StepProps) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Heading */}
      <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-2 text-center">
        Share your work experience
      </h1>
      
      {/* Subtext */}
      <p className="text-gray-600 mb-8 text-center">
        This helps us find the right opportunities for you. You can always update this later.
      </p>

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

        <div className="mb-4">
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
        </div>

        <div className="mb-4">
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
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-10 transition-all hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 px-6 bg-primary text-white font-medium rounded-10 transition-all hover:bg-primary/90"
        >
          Continue
        </button>
      </div>

      {/* Skip Link */}
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

"use client";

import { StepProps } from "@/types/signup";
import { FormField } from "../FormField";
import { CustomDropdown } from "../CustomDropdown";
import { EXPERIENCE_LEVELS } from "@/lib/validation";

/**
 * Step 4: Work Background (Optional)
 * Collects user work experience details
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10
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
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 text-center">
        Share your work experience
      </h1>
      
      {/* Subtext */}
      <p className="text-gray-600 mb-8 text-center">
        This helps us find the right opportunities for you. You can always update this later.
      </p>

      {/* Form Fields */}
      <div className="space-y-1">
        <FormField
          label="Most Recent Job Title"
          name="job_title"
          type="text"
          placeholder="E.g., Registered Nurse, Retail manager"
          value={formData.job_title}
          onChange={(value) => onFieldChange("job_title", value)}
          error={errors.job_title}
        />

        <FormField
          label="Skill Area or Industry"
          name="industry"
          type="text"
          placeholder="E.g., Healthcare, customer service, Admin."
          helperText="What area do you have the most experience in?"
          value={formData.industry}
          onChange={(value) => onFieldChange("industry", value)}
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

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-[10px] transition-all hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 px-6 bg-primary text-white font-medium rounded-[10px] transition-all hover:bg-primary/90"
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

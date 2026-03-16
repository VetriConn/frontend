"use client";

import { StepProps } from "@/types/signup";
import { FormField } from "@/components/ui/FormField";

/**
 * Employer Step 3: Company Information
 * Collects company name, industry, and location for employer accounts.
 */
export const CompanyInfoStep = ({
  formData,
  errors,
  onFieldChange,
  onNext,
  onBack,
}: StepProps) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 text-center">
        Tell us about your company
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        This helps job seekers learn about your organization.
      </p>

      <div className="space-y-1">
        <FormField
          label="Company Name"
          name="company_name"
          type="text"
          placeholder="Enter your company name"
          value={formData.company_name}
          onChange={(value) => onFieldChange("company_name", value)}
          error={errors.company_name}
          required
        />

        <FormField
          label="Industry"
          name="company_industry"
          type="text"
          placeholder="E.g., Healthcare, Technology, Retail"
          helperText="What type of work does your company do?"
          value={formData.company_industry}
          onChange={(value) => onFieldChange("company_industry", value)}
          error={errors.company_industry}
        />

        <FormField
          label="Company Location"
          name="company_location"
          type="text"
          placeholder="City, country"
          helperText="Where is your company based?"
          value={formData.company_location}
          onChange={(value) => onFieldChange("company_location", value)}
          error={errors.company_location}
        />
      </div>

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
    </div>
  );
};

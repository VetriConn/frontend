"use client";

import { StepProps } from "@/types/signup";
import { FormField } from "@/components/ui/FormField";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { COMPANY_INDUSTRY_OPTIONS } from "@/lib/validation";

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
      <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-2 text-center">
        Tell us about your company
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        This helps job seekers learn about your organization.
      </p>

      <div className="space-y-2">
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

        <div className="mb-4">
          <CustomDropdown
            label="Industry"
            name="company_industry"
            placeholder="Select your company's industry"
            helperText="What type of work does your company do?"
            value={formData.company_industry}
            onChange={(value) => onFieldChange("company_industry", value)}
            options={COMPANY_INDUSTRY_OPTIONS}
            error={errors.company_industry}
          />
        </div>

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
    </div>
  );
};

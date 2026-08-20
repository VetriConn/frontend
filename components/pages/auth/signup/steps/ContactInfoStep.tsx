"use client";

import { useMemo } from "react";
import { StepProps } from "@/types/signup";
import { FormField } from "@/components/ui/FormField";
import { PhoneField } from "@/components/ui/PhoneField";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import {
  COUNTRIES,
  regionsFor,
  hasRegions,
  regionLabelFor,
} from "@/lib/regions";

/**
 * Step 3: Contact Information
 * Collects user contact details (phone, city, country)
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10
 */
export const ContactInfoStep = ({
  formData,
  errors,
  onFieldChange,
  onNext,
  onBack,
}: StepProps) => {
  // Step is now optional, so Continue is always enabled
  const isFormValid = true;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Heading */}
      <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-2 text-center">
        How can employers reach you?
      </h1>
      
      {/* Subtext */}
      <p className="text-gray-600 mb-8 text-center">
        This helps us connect you with opportunities near you.
      </p>

      {/* Form Fields */}
      <div className="space-y-1">
        <PhoneField
          label="Phone Number"
          name="phone_number"
          helperText="Employers may use this to contact you about opportunities."
          value={formData.phone_number}
          onChange={(value) => onFieldChange("phone_number", value)}
          error={errors.phone_number}
          optional
        />

        <FormField
          label="City"
          name="city"
          type="text"
          placeholder="Enter your City"
          value={formData.city}
          onChange={(value) => onFieldChange("city", value)}
          error={errors.city}
        />

        <CustomDropdown
          label="Country"
          name="country"
          placeholder="Select your country"
          value={formData.country}
          onChange={(value) => {
            onFieldChange("country", value);
            // Subdivision codes only mean something inside their country.
            if (value !== formData.country) onFieldChange("state_province", "");
          }}
          options={COUNTRIES.map((country) => ({
            value: country,
            label: country,
          }))}
          error={errors.country}
        />

        {hasRegions(formData.country) ? (
          <CustomDropdown
            label={regionLabelFor(formData.country)}
            name="state_province"
            placeholder={`Select your ${regionLabelFor(formData.country).toLowerCase()}`}
            value={formData.state_province}
            onChange={(value) => onFieldChange("state_province", value)}
            options={regionsFor(formData.country).map((region) => ({
              value: region.code,
              label: region.name,
            }))}
            error={errors.state_province}
          />
        ) : (
          formData.country && (
            <FormField
              label={regionLabelFor(formData.country)}
              name="state_province"
              type="text"
              placeholder="Optional"
              value={formData.state_province}
              onChange={(value) => onFieldChange("state_province", value)}
              error={errors.state_province}
            />
          )
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg transition-all hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 px-6 bg-primary text-white font-medium rounded-lg transition-all hover:bg-primary/90"
        >
          Continue
        </button>
      </div>

      {/* Skip Link */}
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onNext}
          className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

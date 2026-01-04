"use client";

import { useMemo } from "react";
import { StepProps } from "@/types/signup";
import { FormField } from "../FormField";

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
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 text-center">
        How can employers reach you?
      </h1>
      
      {/* Subtext */}
      <p className="text-gray-600 mb-8 text-center">
        This helps us connect you with opportunities near you.
      </p>

      {/* Form Fields */}
      <div className="space-y-1">
        <FormField
          label="Phone Number"
          name="phone_number"
          type="tel"
          placeholder="(123) 456-789"
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

        <FormField
          label="Country"
          name="country"
          type="text"
          placeholder="Enter your country"
          value={formData.country}
          onChange={(value) => onFieldChange("country", value)}
          error={errors.country}
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
          onClick={onNext}
          className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

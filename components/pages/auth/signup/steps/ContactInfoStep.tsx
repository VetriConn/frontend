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
import { WizardNav } from "../WizardNav";
import { StepHeader } from "../StepHeader";

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
  currentStep,
  totalSteps,
}: StepProps) => {
  // Step is now optional, so Continue is always enabled
  const isFormValid = true;

  return (
    <div className="w-full max-w-lg mx-auto">
      <StepHeader
        title="How can employers reach you?"
        subtitle="This helps us connect you with opportunities near you."
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

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

      <WizardNav onBack={onBack} onNext={onNext} onSkip={onNext} />
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { PhoneField, validatePhone } from "@/components/ui/PhoneField";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { regionsFor, hasRegions, regionLabelFor } from "@/lib/regions";

export interface ContactInfoFormData {
  phone_number: string;
  city: string;
  /** ISO 3166-2 subdivision code where we enumerate them, else free text. */
  state_province: string;
  country: string;
}

export interface ContactInfoEditFormProps {
  initialData: ContactInfoFormData;
  onDataChange?: (data: ContactInfoFormData) => void;
}

/**
 * ContactInfoEditForm - Form for editing contact information
 * 
 * Features:
 * - Phone number input field with validation
 * - City input field (required)
 * - Country input field (required)
 * - Does NOT include email input field (email is immutable)
 * - Real-time validation
 * 
 * Requirements: 4.2, 4.3, 4.4, 4.5
 */
export const ContactInfoEditForm: React.FC<ContactInfoEditFormProps> = ({
  initialData,
  onDataChange,
}) => {
  const [formData, setFormData] = useState<ContactInfoFormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInfoFormData, string>>>({});

  // Phone number validation — delegates to libphonenumber metadata so that
  // a number is checked against its country's real numbering plan rather
  // than a digit-count heuristic.
  const validatePhoneNumber = (phone: string): string | undefined =>
    validatePhone(phone, { required: true });

  // Required field validation
  const validateRequired = (value: string, fieldName: string): string | undefined => {
    if (!value || value.trim() === "") {
      return `${fieldName} is required`;
    }
    return undefined;
  };

  // Handle field change with validation
  const handleFieldChange = (field: keyof ContactInfoFormData, value: string) => {
    const updatedData = { ...formData, [field]: value };

    // Subdivision codes are only meaningful within their country, so changing
    // the country clears the region rather than leaving "ON" under Australia.
    if (field === "country" && value !== formData.country) {
      updatedData.state_province = "";
    }

    setFormData(updatedData);

    // Validate the field
    let error: string | undefined;
    if (field === "phone_number") {
      error = validatePhoneNumber(value);
    } else if (field === "city") {
      // City tracks the region: required only where the region is (CA/US), so
      // a country with an optional province/state doesn't demand a city.
      error = hasRegions(updatedData.country)
        ? validateRequired(value, "City")
        : undefined;
    } else if (field === "country") {
      error = validateRequired(value, "Country");
    } else if (field === "state_province" && hasRegions(updatedData.country)) {
      error = validateRequired(value, regionLabelFor(updatedData.country));
    }

    // Update errors
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    // Notify parent of data change
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  // Validate all fields
  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof ContactInfoFormData, string>> = {};

    const phoneError = validatePhoneNumber(formData.phone_number);
    if (phoneError) newErrors.phone_number = phoneError;

    const countryError = validateRequired(formData.country, "Country");
    if (countryError) newErrors.country = countryError;

    // Province/state and city are required together, and only where the region
    // list is authoritative (CA/US). Elsewhere both are optional — a country
    // with a free-text region shouldn't demand a city either.
    if (hasRegions(formData.country)) {
      const regionError = validateRequired(
        formData.state_province,
        regionLabelFor(formData.country),
      );
      if (regionError) newErrors.state_province = regionError;

      const cityError = validateRequired(formData.city, "City");
      if (cityError) newErrors.city = cityError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose validation method to parent via ref or callback
  React.useEffect(() => {
    // Store validation function on the form element for parent access
    const formElement = document.getElementById("contact-info-form");
    if (formElement) {
      (formElement as any).validate = validateAll;
      (formElement as any).getData = () => formData;
    }
  }, [formData]);

  return (
    <div id="contact-info-form" className="space-y-4 md:space-y-6">
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value={formData.phone_number}
        onChange={(value) => handleFieldChange("phone_number", value)}
        error={errors.phone_number}
        required
        helperText="Select your country, then enter your number"
      />

      {/* Location, narrowing down: country → state/province → city. */}
      <CountrySelect
        value={formData.country}
        onChange={(value) => handleFieldChange("country", value)}
        error={errors.country}
        required
      />

      {/* A dropdown where the subdivisions are known, free text otherwise —
          "province or state" does not mean the same thing everywhere. */}
      {hasRegions(formData.country) ? (
        <CustomDropdown
          label={regionLabelFor(formData.country)}
          name="state_province"
          placeholder={`Select your ${regionLabelFor(formData.country).toLowerCase()}`}
          value={formData.state_province}
          onChange={(value) => handleFieldChange("state_province", value)}
          options={regionsFor(formData.country).map((region) => ({
            value: region.code,
            label: region.name,
          }))}
          error={errors.state_province}
          required
        />
      ) : (
        <FormField
          label={regionLabelFor(formData.country)}
          name="state_province"
          type="text"
          placeholder="Optional"
          value={formData.state_province}
          onChange={(value) => handleFieldChange("state_province", value)}
          error={errors.state_province}
        />
      )}

      <FormField
        label="City"
        name="city"
        type="text"
        placeholder="Enter your city"
        value={formData.city}
        onChange={(value) => handleFieldChange("city", value)}
        error={errors.city}
        required={hasRegions(formData.country)}
      />

      {/* Note: Email field is intentionally NOT included as it is immutable */}
    </div>
  );
};

export default ContactInfoEditForm;

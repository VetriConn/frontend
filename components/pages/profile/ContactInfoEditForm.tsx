"use client";

import React, { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { PhoneField, validatePhone } from "@/components/ui/PhoneField";

export interface ContactInfoFormData {
  phone_number: string;
  city: string;
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
    setFormData(updatedData);

    // Validate the field
    let error: string | undefined;
    if (field === "phone_number") {
      error = validatePhoneNumber(value);
    } else if (field === "city") {
      error = validateRequired(value, "City");
    } else if (field === "country") {
      error = validateRequired(value, "Country");
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

    const cityError = validateRequired(formData.city, "City");
    if (cityError) newErrors.city = cityError;

    const countryError = validateRequired(formData.country, "Country");
    if (countryError) newErrors.country = countryError;

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

      <FormField
        label="City"
        name="city"
        type="text"
        placeholder="Enter your city"
        value={formData.city}
        onChange={(value) => handleFieldChange("city", value)}
        error={errors.city}
        required
      />

      <FormField
        label="Country"
        name="country"
        type="text"
        placeholder="Enter your country"
        value={formData.country}
        onChange={(value) => handleFieldChange("country", value)}
        error={errors.country}
        required
      />

      {/* Note: Email field is intentionally NOT included as it is immutable */}
    </div>
  );
};

export default ContactInfoEditForm;

"use client";

import { useMemo } from "react";
import { StepProps } from "@/types/signup";
import { FormField } from "../FormField";
import { PasswordField } from "../PasswordField";
import { step2Schema } from "@/lib/validation";

/**
 * Step 2: Create Account
 * Collects user credentials (name, email, password)
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.9, 3.10, 3.11, 3.12
 */
export const CreateAccountStep = ({
  formData,
  errors,
  onFieldChange,
  onNext,
  onBack,
}: StepProps) => {
  // Validate form to determine if Continue button should be enabled
  const isFormValid = useMemo(() => {
    const result = step2Schema.safeParse({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });
    return result.success;
  }, [formData.fullName, formData.email, formData.password, formData.confirmPassword]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 text-center">
        Create your account
      </h1>
      
      {/* Subtext */}
      <p className="text-gray-600 mb-8 text-center">
        Your information is safe and secure with us
      </p>

      {/* Form Fields */}
      <div className="space-y-1">
        <FormField
          label="Full Name"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(value) => onFieldChange("fullName", value)}
          error={errors.fullName}
          required
        />

        <FormField
          label="Email Address"
          name="email"
          type="email"
          placeholder="Enter your email address"
          helperText="we will use this to send you updates and job alerts"
          value={formData.email}
          onChange={(value) => onFieldChange("email", value)}
          error={errors.email}
          required
        />

        <PasswordField
          label="Password"
          name="password"
          placeholder="create a password"
          value={formData.password}
          onChange={(value) => onFieldChange("password", value)}
          error={errors.password}
          showRequirements={formData.password.length > 0}
        />

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(value) => onFieldChange("confirmPassword", value)}
          error={errors.confirmPassword}
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
          disabled={!isFormValid}
          className="flex-1 py-3 px-6 bg-primary text-white font-medium rounded-[10px] transition-all hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StepProps } from "@/types/signup";
import { FormField } from "@/components/ui/FormField";
import { PasswordField, isPasswordValid } from "@/components/ui/PasswordField";
import { step2Schema } from "@/lib/validation";
import { useEmailAvailability } from "@/hooks/useEmailAvailability";
import { WizardNav } from "../WizardNav";
import { StepHeader } from "../StepHeader";

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
  currentStep,
  totalSteps,
}: StepProps) => {
  const isFormValid = useMemo(() => {
    const result = step2Schema.safeParse({
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });
    return result.success;
  }, [formData.full_name, formData.email, formData.password, formData.confirmPassword]);

  // The password checklist stays hidden until someone tries to continue with a
  // password that doesn't meet the rules — cleaner by default, still helpful
  // exactly when it's needed. Once revealed it updates live and vanishes again
  // the moment every rule is met.
  const [passwordHelpRequested, setPasswordHelpRequested] = useState(false);
  const passwordValid = isPasswordValid(formData.password);
  const showPasswordReqs = passwordHelpRequested && !passwordValid;

  // Debounced "is this email already registered?" — a friendly heads-up before
  // submit. The backend still rejects a duplicate outright, so this only has to
  // guide, never guard.
  const emailStatus = useEmailAvailability(formData.email);
  const emailTaken = emailStatus === "taken";

  // Enabled once every field has content, so a weak password is clickable and
  // can surface the help — rather than a dead button with no explanation. A
  // known-taken email holds it, since that submit cannot succeed.
  const allFilled = Boolean(
    formData.full_name.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.confirmPassword,
  );

  const handleContinue = () => {
    if (!isFormValid && !passwordValid) setPasswordHelpRequested(true);
    // The wizard validates and surfaces any other field errors (email format,
    // password mismatch) and only advances when everything checks out.
    onNext();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <StepHeader
        title="Create your account"
        subtitle="Your information is safe and secure with us"
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      {/* Form Fields */}
      <div className="space-y-1">
        <FormField
          label="Full Name"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          value={formData.full_name}
          onChange={(value) => onFieldChange("full_name", value)}
          error={errors.full_name}
          required
        />

        <div>
          <FormField
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email address"
            helperText=""
            value={formData.email}
            onChange={(value) => onFieldChange("email", value)}
            error={
              emailTaken
                ? "An account with this email already exists"
                : errors.email
            }
            required
          />
          {emailStatus === "checking" && (
            <p className="-mt-2 text-xs text-gray-400">
              Checking availability…
            </p>
          )}
          {emailTaken && (
            <p className="-mt-2 text-xs">
              <Link
                href="/signin"
                className="font-medium text-primary hover:underline"
              >
                Sign in instead →
              </Link>
            </p>
          )}
        </div>

        <PasswordField
          label="Password"
          name="password"
          placeholder="create a password"
          value={formData.password}
          onChange={(value) => onFieldChange("password", value)}
          // The checklist is the error display once it's showing, so the raw
          // zod message would only duplicate it.
          error={showPasswordReqs ? undefined : errors.password}
          showRequirements={showPasswordReqs}
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

      <WizardNav
        onBack={onBack}
        onNext={handleContinue}
        nextDisabled={!allFilled || emailTaken}
      />
    </div>
  );
};

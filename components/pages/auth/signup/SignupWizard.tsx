"use client";

import { useReducer, useEffect, useCallback } from "react";
import {
  SignupFormData,
  SignupWizardState,
  SignupAction,
  STEP_CONFIGS,
  TOTAL_STEPS,
  INITIAL_FORM_DATA,
} from "@/types/signup";
import { AuthHeader } from "@/components/ui/AuthHeader";
import { AuthFooter } from "@/components/ui/AuthFooter";
import { StepIndicator } from "./StepIndicator";
import {
  AccountTypeStep,
  CreateAccountStep,
  ContactInfoStep,
  WorkBackgroundStep,
  ResumeUploadStep,
  CompletionStep,
} from "./steps";
import { step1Schema, step2Schema, step3Schema } from "@/lib/validation";
import {
  registerUser,
  uploadResume,
  resendVerificationEmail,
} from "@/lib/api/auth";
import { useToaster } from "@/components/ui/Toaster";

// Session storage key for persisting wizard state
const STORAGE_KEY = "vetriconn_signup_wizard_state";

/**
 * Initial state for the signup wizard
 */
const initialState: SignupWizardState = {
  currentStep: 1,
  highestCompletedStep: 0, // Track highest step user has reached
  formData: INITIAL_FORM_DATA,
  errors: {},
  isSubmitting: false,
};

/**
 * Reducer function for managing signup wizard state
 */
function signupReducer(
  state: SignupWizardState,
  action: SignupAction,
): SignupWizardState {
  switch (action.type) {
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.payload,
        errors: {}, // Clear errors when changing steps
      };
    case "UPDATE_FIELD":
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.field]: action.payload.value,
        },
        // Clear error for the field being updated
        errors: {
          ...state.errors,
          [action.payload.field]: "",
        },
      };
    case "SET_ERRORS":
      return {
        ...state,
        errors: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: "",
        },
      };
    case "SET_SUBMITTING":
      return {
        ...state,
        isSubmitting: action.payload,
      };
    case "SET_HIGHEST_COMPLETED_STEP":
      return {
        ...state,
        highestCompletedStep: Math.max(
          state.highestCompletedStep,
          action.payload,
        ),
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

/**
 * Serialize form data for session storage (handles File objects)
 */
function serializeFormData(formData: SignupFormData): string {
  const serializable = {
    ...formData,
    // File objects cannot be serialized, store metadata instead
    resumeFile: formData.resumeFile
      ? {
          name: formData.resumeFile.name,
          size: formData.resumeFile.size,
          type: formData.resumeFile.type,
        }
      : null,
  };
  return JSON.stringify(serializable);
}

/**
 * Load state from session storage
 * Automatically clears storage if data is older than 1 hour
 */
function loadStateFromStorage(): Partial<SignupWizardState> | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const timestamp = parsed.timestamp || 0;
    const now = Date.now();
    const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds

    // Check if data is older than 1 hour
    if (now - timestamp > oneHourInMs) {
      // Clear expired data
      clearStateFromStorage();
      return null;
    }

    return {
      currentStep: parsed.currentStep,
      highestCompletedStep: parsed.highestCompletedStep || 0,
      formData: {
        ...parsed.formData,
        // File cannot be restored from storage, set to null
        resumeFile: null,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Save state to session storage with timestamp
 */
function saveStateToStorage(state: SignupWizardState): void {
  if (typeof window === "undefined") return;

  try {
    const toStore = {
      timestamp: Date.now(), // Add timestamp for expiry check
      currentStep: state.currentStep,
      highestCompletedStep: state.highestCompletedStep,
      formData: JSON.parse(serializeFormData(state.formData)),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Silently fail if storage is not available
  }
}

/**
 * Clear state from session storage
 */
function clearStateFromStorage(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * SignupWizard Component
 * Main container for the multi-step signup flow
 * Requirements: 1.5, 1.6, 9.1, 9.2, 9.3, 9.5
 */
export function SignupWizard() {
  const [state, dispatch] = useReducer(signupReducer, initialState);
  const { showToast } = useToaster();
  const { currentStep, formData, errors } = state;

  // Restore state from session storage on mount
  useEffect(() => {
    const savedState = loadStateFromStorage();
    if (savedState) {
      if (savedState.formData) {
        // Restore form data field by field
        Object.entries(savedState.formData).forEach(([field, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            dispatch({
              type: "UPDATE_FIELD",
              payload: { field: field as keyof SignupFormData, value },
            });
          }
        });
      }
      if (savedState.highestCompletedStep !== undefined) {
        dispatch({
          type: "SET_HIGHEST_COMPLETED_STEP",
          payload: savedState.highestCompletedStep,
        });
      }
      if (savedState.currentStep) {
        dispatch({ type: "SET_STEP", payload: savedState.currentStep });
      }
    }
  }, []);

  // Persist state to session storage on step changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Get current step configuration
  const currentStepConfig = STEP_CONFIGS[currentStep - 1];

  /**
   * Validate current step before proceeding
   */
  const validateCurrentStep = useCallback((): boolean => {
    let schema;
    let dataToValidate: Record<string, unknown> = {};

    switch (currentStep) {
      case 1:
        schema = step1Schema;
        dataToValidate = { role: formData.role };
        break;
      case 2:
        schema = step2Schema;
        dataToValidate = {
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        };
        break;
      case 3:
        schema = step3Schema;
        dataToValidate = {
          phone_number: formData.phone_number,
          city: formData.city,
          country: formData.country,
        };
        break;
      default:
        // Steps 4, 5, 6 don't require validation to proceed
        return true;
    }

    const result = schema.safeParse(dataToValidate);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        newErrors[field] = issue.message;
      });
      dispatch({ type: "SET_ERRORS", payload: newErrors });
      return false;
    }

    return true;
  }, [currentStep, formData]);

  /**
   * Handle field change
   */
  const handleFieldChange = useCallback(
    (field: keyof SignupFormData, value: unknown) => {
      dispatch({ type: "UPDATE_FIELD", payload: { field, value } });
    },
    [],
  );

  /**
   * Submit form to backend
   */
  const handleSubmit = useCallback(async () => {
    try {
      dispatch({ type: "SET_SUBMITTING", payload: true });
      dispatch({ type: "SET_ERRORS", payload: {} });

      console.log("handleSubmit: Starting registration...");

      // Register user
      const response = await registerUser(formData);

      console.log("handleSubmit: Registration response:", response);

      if (!response.success) {
        console.log("handleSubmit: Registration failed, success is false");

        // Handle validation errors
        if (response.errors) {
          const errorMap: Record<string, string> = {};
          response.errors.forEach((err: any) => {
            errorMap[err.field] = err.message;
          });
          dispatch({ type: "SET_ERRORS", payload: errorMap });
        }

        // Show toast notification for error
        showToast({
          type: "error",
          title: "Registration Failed",
          description:
            response.message || "Please check your information and try again.",
        });

        console.error("Registration failed:", response.message);
        dispatch({ type: "SET_SUBMITTING", payload: false });
        return false;
      }

      console.log("handleSubmit: Registration successful");

      // Store token in localStorage
      if (response.data?.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      // Upload resume if provided
      if (formData.resumeFile && response.data?.token) {
        const uploadResponse = await uploadResume(
          formData.resumeFile,
          response.data.token,
        );

        if (!uploadResponse.success) {
          console.warn("Resume upload failed:", uploadResponse.message);
          // Don't fail the entire registration if resume upload fails
        }
      }

      // Clear session storage on successful registration
      sessionStorage.removeItem(STORAGE_KEY);

      dispatch({ type: "SET_SUBMITTING", payload: false });
      return true;
    } catch (error) {
      console.error("Submission error:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
      dispatch({ type: "SET_SUBMITTING", payload: false });
      return false;
    }
  }, [formData, showToast]);

  /**
   * Handle step 5 (resume upload) submission and progression
   * This is used by both Continue and Upload Later buttons
   */
  const handleStep5Submission = useCallback(async (): Promise<boolean> => {
    console.log("handleStep5Submission: Submitting registration...");
    const success = await handleSubmit();
    console.log("handleStep5Submission: handleSubmit returned:", success);

    if (!success) {
      console.log("handleStep5Submission: Registration failed, NOT proceeding");
      return false;
    }

    console.log(
      "handleStep5Submission: Registration succeeded, proceeding to next step",
    );

    // Update highest completed step and move to next step
    dispatch({ type: "SET_HIGHEST_COMPLETED_STEP", payload: currentStep });
    dispatch({ type: "SET_STEP", payload: currentStep + 1 });

    return true;
  }, [currentStep, handleSubmit]);

  /**
   * Navigate to next step
   */
  const handleNext = useCallback(async () => {
    if (!validateCurrentStep()) {
      return;
    }

    console.log("handleNext: Called for step", currentStep);

    // If moving from step 5 to step 6, submit the form
    if (currentStep === 5) {
      await handleStep5Submission();
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      // Update highest completed step when moving forward
      dispatch({ type: "SET_HIGHEST_COMPLETED_STEP", payload: currentStep });
      dispatch({ type: "SET_STEP", payload: currentStep + 1 });
    }
  }, [currentStep, validateCurrentStep, handleStep5Submission]);

  /**
   * Handle resend verification email
   */
  const handleResendEmail = useCallback(async () => {
    if (!formData.email) {
      throw new Error("Email not found");
    }

    const response = await resendVerificationEmail(formData.email);

    if (!response.success) {
      throw new Error(response.message);
    }
  }, [formData.email]);

  /**
   * Navigate to previous step
   */
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      dispatch({ type: "SET_STEP", payload: currentStep - 1 });
    }
  }, [currentStep]);

  /**
   * Skip current step (for optional steps)
   */
  const handleSkip = useCallback(async () => {
    console.log("handleSkip: Called for step", currentStep);

    // For step 5 (resume upload), use the same submission logic as Continue button
    if (currentStep === 5) {
      await handleStep5Submission();
      return;
    }

    // For other steps, just skip without validation
    if (currentStep < TOTAL_STEPS) {
      dispatch({ type: "SET_HIGHEST_COMPLETED_STEP", payload: currentStep });
      dispatch({ type: "SET_STEP", payload: currentStep + 1 });
    }
  }, [currentStep, handleStep5Submission]);

  /**
   * Render the current step component
   */
  const renderStep = () => {
    const stepProps = {
      formData,
      errors,
      onFieldChange: handleFieldChange,
      onNext: handleNext,
      onBack: handleBack,
      onSkip: handleSkip,
    };

    switch (currentStep) {
      case 1:
        return <AccountTypeStep {...stepProps} />;
      case 2:
        return <CreateAccountStep {...stepProps} />;
      case 3:
        return <ContactInfoStep {...stepProps} />;
      case 4:
        return <WorkBackgroundStep {...stepProps} />;
      case 5:
        return <ResumeUploadStep {...stepProps} />;
      case 6:
        // Don't clear storage yet - wait until after email verification
        return (
          <CompletionStep
            formData={formData}
            onResendEmail={handleResendEmail}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAF9] flex flex-col">
      {/* Header */}
      <AuthHeader />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {/* Step Indicator - Hide on completion step, outside the card */}
          {currentStep < TOTAL_STEPS && (
            <div className="mb-6">
              <StepIndicator
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                stepName={currentStepConfig.name}
              />
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mobile:p-6">
            {/* Current Step Content */}
            {renderStep()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}

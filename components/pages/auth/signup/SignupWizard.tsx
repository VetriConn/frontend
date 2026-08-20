"use client";

import { useReducer, useEffect, useCallback, useRef, useState } from "react";
import {
  SignupFormData,
  SignupWizardState,
  SignupAction,
  STEP_CONFIGS,
  INITIAL_FORM_DATA,
} from "@/types/signup";
import Link from "next/link";
import DottedBox7 from "@/public/images/dotted_box_7.svg";
import DottedBox9 from "@/public/images/dotted_box_9.svg";
import { StepIndicator } from "./StepIndicator";
import {
  CreateAccountStep,
  ContactInfoStep,
  WorkBackgroundStep,
  ResumeUploadStep,
  CompletionStep,
} from "./steps";
import {
  step2Schema,
  step3Schema,
} from "@/lib/validation";
import { registerUser, resendVerificationEmail } from "@/lib/api/auth";
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
  const [isActionLocked, setIsActionLocked] = useState(false);
  const actionLockTimerRef = useRef<number | null>(null);
  const { showToast } = useToaster();
  const { currentStep, formData, errors } = state;

  const lockAction = useCallback((): boolean => {
    if (state.isSubmitting || isActionLocked) {
      return false;
    }
    setIsActionLocked(true);
    return true;
  }, [state.isSubmitting, isActionLocked]);

  const releaseActionWithDebounce = useCallback(() => {
    if (actionLockTimerRef.current) {
      window.clearTimeout(actionLockTimerRef.current);
    }
    actionLockTimerRef.current = window.setTimeout(() => {
      setIsActionLocked(false);
    }, 800);
  }, []);

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

  useEffect(() => {
    return () => {
      if (actionLockTimerRef.current) {
        window.clearTimeout(actionLockTimerRef.current);
      }
    };
  }, []);

  // Persist state to session storage on step changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // One flow for everyone — there is no account type to branch on.
  const totalSteps = STEP_CONFIGS.length;
  const stepConfigs = STEP_CONFIGS;
  const currentStepConfig = stepConfigs[currentStep - 1];

  /**
   * Validate current step before proceeding
   */
  const validateCurrentStep = useCallback((): boolean => {
    let schema;
    let dataToValidate: Record<string, unknown> = {};

    switch (currentStep) {
      case 1:
        schema = step2Schema;
        dataToValidate = {
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        };
        break;
      case 2:
        schema = step3Schema;
        dataToValidate = {
          phone_number: formData.phone_number,
          city: formData.city,
          country: formData.country,
        };
        break;
      default:
        // The remaining steps are optional and need no gate.
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

      // Register user
      const response = await registerUser(formData);

      if (!response.success) {
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
        dispatch({ type: "SET_SUBMITTING", payload: false });
        return false;
      }

      if (formData.resumeFile) {
        // Resume upload is intentionally deferred until post-verification sign-in.
      }

      // Clear session storage on successful registration
      sessionStorage.removeItem(STORAGE_KEY);

      dispatch({ type: "SET_SUBMITTING", payload: false });
      return true;
    } catch {
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
   * Handle final step submission and progression to completion
   * For job seekers: triggered on step 5 (resume upload)
   * For employers: triggered on step 3 (company info)
   */
  const handleFinalStepSubmission = useCallback(async (): Promise<boolean> => {
    const success = await handleSubmit();

    if (!success) {
      return false;
    }

    // Update highest completed step and move to completion
    dispatch({ type: "SET_HIGHEST_COMPLETED_STEP", payload: currentStep });
    dispatch({ type: "SET_STEP", payload: currentStep + 1 });

    return true;
  }, [currentStep, handleSubmit]);

  /**
   * Navigate to next step
   */
  const handleNext = useCallback(async () => {
    if (!lockAction()) {
      return;
    }

    try {
      if (!validateCurrentStep()) {
        return;
      }

      // If on the last step before completion, submit the form
      if (currentStep === totalSteps - 1) {
        await handleFinalStepSubmission();
        return;
      }

      if (currentStep < totalSteps) {
        // Update highest completed step when moving forward
        dispatch({ type: "SET_HIGHEST_COMPLETED_STEP", payload: currentStep });
        dispatch({ type: "SET_STEP", payload: currentStep + 1 });
      }
    } finally {
      releaseActionWithDebounce();
    }
  }, [
    currentStep,
    totalSteps,
    validateCurrentStep,
    handleFinalStepSubmission,
    lockAction,
    releaseActionWithDebounce,
  ]);

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
    if (!lockAction()) {
      return;
    }

    try {
      // For the final step before completion, use submission logic
      if (currentStep === totalSteps - 1) {
        await handleFinalStepSubmission();
        return;
      }

      // For other steps, just skip without validation
      if (currentStep < totalSteps) {
        dispatch({ type: "SET_HIGHEST_COMPLETED_STEP", payload: currentStep });
        dispatch({ type: "SET_STEP", payload: currentStep + 1 });
      }
    } finally {
      releaseActionWithDebounce();
    }
  }, [
    currentStep,
    totalSteps,
    handleFinalStepSubmission,
    lockAction,
    releaseActionWithDebounce,
  ]);

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
      isBusy: state.isSubmitting || isActionLocked,
    };

    switch (currentStep) {
      case 1:
        return <CreateAccountStep {...stepProps} />;
      case 2:
        return <ContactInfoStep {...stepProps} />;
      case 3:
        return <WorkBackgroundStep {...stepProps} />;
      case 4:
        return <ResumeUploadStep {...stepProps} />;
      case 5:
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
    <div className="flex min-h-screen font-open-sans">
      {/* Left — image panel, matching sign in. Fixed to the viewport so the
          taller signup form scrolls past it rather than dragging it along.
          Hidden below md, where the form takes the full width. */}
      <div className="hidden md:flex md:w-1/2 lg:w-[45%] self-start sticky top-0 h-screen relative items-center justify-center p-8 text-left bg-[linear-gradient(70deg,rgba(0,0,0,0.65),rgba(0,0,0,0.45)),url('/images/Hero/1.svg')] bg-right bg-cover">
        <DottedBox9 className="absolute top-50 right-10 w-32 h-auto z-0 opacity-60" />
        <h1 className="font-lato text-2xl md:text-4xl mb-4 text-white font-semibold leading-tight drop-shadow-lg">
          Join the <br />{" "}
          <span className="text-primary drop-shadow-lg">Vetriconn</span> community
        </h1>
        <DottedBox7 className="absolute bottom-80 left-15 w-32 h-auto z-0 opacity-60" />
      </div>

      {/* Right — signup form */}
      <div className="flex-1 min-w-0 flex flex-col bg-white">
        {/* Top bar: logo home + support, carried over from AuthHeader. */}
        <div className="flex items-center justify-between gap-4 px-6 md:px-10 py-5">
          <Link href="/" aria-label="Go to homepage">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo_1.svg"
              alt="Vetriconn"
              className="w-36 h-auto"
            />
          </Link>
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact support
            </Link>
          </p>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex items-start justify-center px-4 md:px-8 pt-2 pb-12">
          <div className="w-full max-w-xl">
            {/* Step Indicator - Hide on completion step, outside the card */}
            {currentStep < totalSteps && (
              <div className="mb-6">
                <StepIndicator
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  stepName={currentStepConfig?.name || ""}
                />
              </div>
            )}

            {/* Form Card. A light border in addition to the shadow, so it
                still reads now that the column behind it is white. */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mobile:p-6">
              {/* Current Step Content */}
              {renderStep()}
            </div>

            {/* Footer links - minimal, below card */}
            <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/signin" className="text-primary hover:underline font-medium">
                Sign in
              </a>
            </p>
            <p className="text-xs text-gray-500">
              By signing up, you agree to our{" "}
              <a 
                href="https://vetriconntandc.notion.site/VETRICONN-INC-TERMS-AND-CONDITIONS-22ac6380202c807fa63ef48c7ca69815" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a 
                href="https://vetriconntandc.notion.site/VETRICONN-INC-TERMS-AND-CONDITIONS-22ac6380202c807fa63ef48c7ca69815" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Privacy Guide
              </a>
            </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Signup flow types for Vetriconn platform

/**
 * Form data collected across all signup steps
 */
export interface SignupFormData {
  // Step 1 - Account Type
  role: 'job_seeker' | 'employer' | null;

  // Step 2 - Create Account
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Step 3 - Contact Info
  phone_number: string;
  city: string;
  country: string;

  // Step 4 - Work Background (optional)
  job_title: string;
  industry: string;
  years_of_experience: string;

  // Step 5 - Resume Upload (optional)
  resumeFile: File | null;
}

/**
 * Configuration for each step in the signup wizard
 */
export interface SignupStepConfig {
  id: number;
  name: string;
  isOptional: boolean;
  fields: (keyof SignupFormData)[];
}

/**
 * Props passed to each step component
 */
export interface StepProps {
  formData: SignupFormData;
  errors: Record<string, string>;
  onFieldChange: (field: keyof SignupFormData, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

/**
 * State for the signup wizard reducer
 */
export interface SignupWizardState {
  currentStep: number;
  highestCompletedStep: number; // Track the highest step user has reached
  formData: SignupFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

/**
 * Actions for the signup wizard reducer
 */
export type SignupAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof SignupFormData; value: unknown } }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_HIGHEST_COMPLETED_STEP'; payload: number }
  | { type: 'RESET' };

/**
 * Step configuration array with step names and field mappings
 * Used by StepIndicator and SignupWizard for navigation and validation
 */
export const STEP_CONFIGS: SignupStepConfig[] = [
  {
    id: 1,
    name: 'Account Type',
    isOptional: false,
    fields: ['role'],
  },
  {
    id: 2,
    name: 'Create Account',
    isOptional: false,
    fields: ['full_name', 'email', 'password', 'confirmPassword'],
  },
  {
    id: 3,
    name: 'Contact Info',
    isOptional: false,
    fields: ['phone_number', 'city', 'country'],
  },
  {
    id: 4,
    name: 'Work Background',
    isOptional: true,
    fields: ['job_title', 'industry', 'years_of_experience'],
  },
  {
    id: 5,
    name: 'Resume Upload',
    isOptional: true,
    fields: ['resumeFile'],
  },
  {
    id: 6,
    name: 'Complete',
    isOptional: false,
    fields: [],
  },
];

/**
 * Total number of steps in the signup wizard
 */
export const TOTAL_STEPS = STEP_CONFIGS.length;

/**
 * Initial form data state
 */
export const INITIAL_FORM_DATA: SignupFormData = {
  role: null,
  full_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone_number: '',
  city: '',
  country: '',
  job_title: '',
  industry: '',
  years_of_experience: '',
  resumeFile: null,
};

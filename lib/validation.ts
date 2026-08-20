import { z } from "zod";

// Password validation schema for sign up (strict)
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol");

// Password validation schema for sign in (only non-empty)
const signInPasswordSchema = z.string().min(1, "Password is required");

// Sign in validation schema
export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: signInPasswordSchema,
});

// Sign up validation schema
export const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
  role: z.string().refine((val) => val === "jobseeker", {
    message: "Please select job seeker role",
  }),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export type SignInFormData = {
  email: string;
  password: string;
  terms: boolean;
};

export type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  terms: boolean;
};

// Multi-step signup validation schemas

// Step 1: Account Type Selection
// Step 2: Create Account
export const step2Schema = z
  .object({
    full_name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Step 3: Contact Information (now optional)
export const step3Schema = z.object({
  phone_number: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

// Step 4: Work Background (all optional)
export const step4Schema = z.object({
  job_title: z.string().optional(),
  industry: z.string().optional(),
  years_of_experience: z.string().optional(),
});

// Step 5: Resume Upload
export const step5Schema = z.object({
  resumeFile: z.instanceof(File).nullable().optional(),
});

// Employer Step 3: Company Information
// Experience levels for dropdown (standardized format matching profile settings)
export const EXPERIENCE_LEVELS = [
  { value: "0-2 years", label: "0–2 years" },
  { value: "3-5 years", label: "3–5 years" },
  { value: "6-10 years", label: "6–10 years" },
  { value: "11-15 years", label: "11–15 years" },
  { value: "16-20 years", label: "16–20 years" },
  { value: "20+ years", label: "20+ years" },
];

// Industry options for job seekers (standardized format matching profile settings)
export const INDUSTRY_OPTIONS = [
  { value: "Government & Public Administration", label: "Government & Public Administration" },
  { value: "Defence & Military", label: "Defence & Military" },
  { value: "Healthcare & Medical", label: "Healthcare & Medical" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Engineering", label: "Engineering" },
  { value: "Logistics & Supply Chain", label: "Logistics & Supply Chain" },
  { value: "Education & Training", label: "Education & Training" },
  { value: "Construction & Trades", label: "Construction & Trades" },
  { value: "Finance & Accounting", label: "Finance & Accounting" },
  { value: "Law Enforcement & Security", label: "Law Enforcement & Security" },
  { value: "Transportation", label: "Transportation" },
  { value: "Telecommunications", label: "Telecommunications" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Non-profit & Community", label: "Non-profit & Community" },
  { value: "Other", label: "Other" },
];

// Company industry options for employers (standardized format matching company profile)
export const COMPANY_INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology & Consulting" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance & Banking" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "construction", label: "Construction" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "nonprofit", label: "Non-profit & Social Services" },
  { value: "other", label: "Other" },
];

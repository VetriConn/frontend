import { z } from "zod";

// Password validation schema for sign in (only non-empty)
const signInPasswordSchema = z.string().min(1, "Password is required");

// Sign in validation schema
export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: signInPasswordSchema,
});

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


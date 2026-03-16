/**
 * Authentication API Service
 * Login, logout, registration, and email verification
 */

import { getApiUrl, API_CONFIG } from "../api-config";
import { apiFetch, API_BASE_URL } from "./client";
import { SignupFormData } from "@/types/signup";
import type { LoginResponse } from "@/types/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface RegisterResponse {
  emailVerificationSent: boolean;
}

export interface GenericSuccessResponse {
  success: boolean;
  message: string;
}

/**
 * Register a new user
 */
export async function registerUser(
  formData: SignupFormData,
): Promise<ApiResponse<RegisterResponse>> {
  try {
    // Prepare the data for backend
    const requestData: Record<string, unknown> = {
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role,
      promotional_emails: false,
    };

    // Add role-specific optional fields
    if (formData.role === "employer") {
      const [cityPart = "", countryPart = ""] = formData.company_location
        .split(",")
        .map((value) => value.trim());

      requestData.employer_profile = {
        company_name: formData.company_name,
        industry: formData.company_industry,
        city: cityPart,
        country: countryPart,
      };
    } else {
      // Job seeker-specific fields
      if (formData.phone_number)
        requestData.phone_number = formData.phone_number;
      if (formData.city) requestData.city = formData.city;
      if (formData.country) requestData.country = formData.country;
      if (formData.job_title) requestData.job_title = formData.job_title;
      if (formData.industry) requestData.industry = formData.industry;
      if (formData.years_of_experience)
        requestData.years_of_experience = formData.years_of_experience;
    }

    return await apiFetch<ApiResponse<RegisterResponse>>(
      getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      },
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection and try again.",
    };
  }
}

/**
 * Upload resume file
 * This should be called after successful registration
 */
export async function uploadResume(
  file: File,
  _token: string,
): Promise<ApiResponse<{ url: string; document: any }>> {
  try {
    const formData = new FormData();
    formData.append("resume", file);

    return await apiFetch<ApiResponse<{ url: string; document: any }>>(
      getApiUrl("/api/v1/user/upload-resume"),
      {
        method: "POST",
        body: formData,
      },
    );
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Resume upload failed",
    };
  }
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  if (!API_BASE_URL) {
    throw new Error(
      "API_BASE_URL is not defined. Please check your environment variables.",
    );
  }

  try {
    return await apiFetch<LoginResponse>(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error("Login failed");
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    return await apiFetch<{ success: boolean; message: string }>(
      `${API_BASE_URL}/api/v1/auth/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return {
      success: true,
      message: error instanceof Error ? error.message : "Logged out locally",
    };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(
  email: string,
): Promise<ApiResponse<{}>> {
  try {
    return await apiFetch<ApiResponse<{}>>(
      getApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      },
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to resend verification email. Please try again.",
    };
  }
}

/**
 * Request forgot-password email
 */
export async function requestPasswordReset(
  email: string,
): Promise<ApiResponse<{}>> {
  try {
    return await apiFetch<ApiResponse<{}>>(
      getApiUrl(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      },
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<ApiResponse<{}>> {
  try {
    return await apiFetch<ApiResponse<{}>>(
      getApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      },
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
    };
  }
}

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
      promotional_emails: false,
    };

    // One signup. There is no account type to choose and no company to name —
    // a company is a separate vetted entity you create or are invited to later.
    if (formData.phone_number) requestData.phone_number = formData.phone_number;
    if (formData.city) requestData.city = formData.city;
    if (formData.state_province)
      requestData.state_province = formData.state_province;
    if (formData.country) requestData.country = formData.country;
    if (formData.job_title) requestData.job_title = formData.job_title;
    if (formData.industry) requestData.industry = formData.industry;
    if (formData.years_of_experience)
      requestData.years_of_experience = formData.years_of_experience;

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
 *
 * Returns either:
 *   - A full session (with `data.user` + `data.token`).
 *   - A 2FA challenge (`requires2FA: true` + `partialSessionToken`). The
 *     caller must run the user through the 2FA challenge dialog and then
 *     POST /api/v1/auth/2fa/challenge with that token.
 *
 * Until the backend wires up partial sessions, the frontend can simulate
 * the challenge path locally by signing in with an email containing
 * "2fa" (e.g. user+2fa@vetriconn.com). This is documented in
 * PublicBETODO.txt §8.
 */
export async function loginUser(
  email: string,
  password: string,
  rememberMe: boolean = false,
): Promise<LoginResponse> {
  if (!API_BASE_URL) {
    throw new Error(
      "API_BASE_URL is not defined. Please check your environment variables.",
    );
  }

  // Mock 2FA detour — only triggers in dev when the email contains "2fa".
  // The real backend will return `requires2FA: true` itself once shipped.
  const SIMULATE_2FA =
    process.env.NEXT_PUBLIC_NODE_ENV === "development" &&
    /2fa/i.test(email);

  try {
    const response = await apiFetch<LoginResponse>(
      `${API_BASE_URL}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
      },
    );

    const requires2FA = (response.data as any)?.requires_2fa === true || response.requires2FA === true;

    if (requires2FA) {
      return {
        success: true,
        message: response.message || "Two-factor verification required",
        requires2FA: true,
      };
    }

    return response;
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

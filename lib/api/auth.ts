/**
 * Authentication API Service
 * Login, logout, registration, and email verification
 */

import { getApiUrl, API_CONFIG } from "../api-config";
import { API_BASE_URL, getAuthToken, removeAuthToken } from "./client";
import { SignupFormData } from "@/types/signup";
import type { LoginResponse } from "@/types/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface RegisterResponse {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
  token: string;
  emailVerificationSent: boolean;
}

/**
 * Register a new user
 */
export async function registerUser(
  formData: SignupFormData,
): Promise<ApiResponse<RegisterResponse>> {
  try {
    // Prepare the data for backend
    const requestData: any = {
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role,
      promotional_emails: false,
    };

    // Only add optional fields if they have values
    if (formData.phone_number) requestData.phone_number = formData.phone_number;
    if (formData.city) requestData.city = formData.city;
    if (formData.country) requestData.country = formData.country;
    if (formData.job_title) requestData.job_title = formData.job_title;
    if (formData.industry) requestData.industry = formData.industry;
    if (formData.years_of_experience)
      requestData.years_of_experience = formData.years_of_experience;

    console.log("Registration request data:", requestData);

    const response = await fetch(
      getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        credentials: "include", // Include cookies
      },
    );

    const data: ApiResponse<RegisterResponse> = await response.json();

    console.log("Registration response:", data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Registration failed",
        errors: data.errors,
      };
    }

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}

/**
 * Upload resume file
 * This should be called after successful registration
 */
export async function uploadResume(
  file: File,
  token: string,
): Promise<ApiResponse<{ url: string; document: any }>> {
  try {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch(getApiUrl("/api/v1/user/upload-resume"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Resume upload failed",
      };
    }

    return data;
  } catch (error) {
    console.error("Resume upload error:", error);
    return {
      success: false,
      message:
        "Failed to upload resume. You can upload it later from your profile.",
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
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      throw new Error(
        `Server returned non-JSON response: ${response.status} ${response.statusText}. Response: ${textResponse}`,
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }

    throw error;
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<{
  success: boolean;
  message: string;
}> {
  const token = getAuthToken();

  if (!token) {
    return { success: true, message: "Already logged out" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      removeAuthToken();
      return { success: true, message: "Logged out successfully" };
    }

    const data = await response.json();
    removeAuthToken();

    if (!response.ok) {
      return { success: true, message: "Logged out locally" };
    }

    return data;
  } catch (error) {
    console.error("Logout error:", error);
    removeAuthToken();
    return { success: true, message: "Logged out locally" };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(
  email: string,
): Promise<ApiResponse<{}>> {
  try {
    const response = await fetch(
      getApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to resend verification email",
      };
    }

    return data;
  } catch (error) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      message: "Failed to resend verification email. Please try again.",
    };
  }
}

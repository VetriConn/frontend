/**
 * Authentication API Service
 * Handles all auth-related API calls to the backend
 */

import { getApiUrl, API_CONFIG } from '../api-config';
import { SignupFormData } from '@/types/signup';

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
  formData: SignupFormData
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
    if (formData.years_of_experience) requestData.years_of_experience = formData.years_of_experience;

    console.log('Registration request data:', requestData);

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      credentials: 'include', // Include cookies
    });

    const data: ApiResponse<RegisterResponse> = await response.json();
    
    console.log('Registration response:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Registration failed',
        errors: data.errors,
      };
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}

/**
 * Upload resume file
 * This should be called after successful registration
 */
export async function uploadResume(
  file: File,
  token: string
): Promise<ApiResponse<{ url: string; document: any }>> {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(getApiUrl('/api/v1/user/upload-resume'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Resume upload failed',
      };
    }

    return data;
  } catch (error) {
    console.error('Resume upload error:', error);
    return {
      success: false,
      message: 'Failed to upload resume. You can upload it later from your profile.',
    };
  }
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<ApiResponse<RegisterResponse>> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Login failed',
      };
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}

/**
 * Logout user
 */
export async function logoutUser(token?: string): Promise<ApiResponse> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT), {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Logout failed',
    };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(
  email: string
): Promise<ApiResponse<{}>> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to resend verification email',
      };
    }

    return data;
  } catch (error) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      message: 'Failed to resend verification email. Please try again.',
    };
  }
}

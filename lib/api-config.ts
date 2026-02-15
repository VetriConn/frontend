/**
 * API Configuration
 * Dynamically selects backend URL based on environment
 */

const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";

export const API_CONFIG = {
  BASE_URL: isDevelopment
    ? process.env.NEXT_PUBLIC_BACKEND_URL_DEV
    : process.env.NEXT_PUBLIC_BACKEND_URL_PROD,

  ENDPOINTS: {
    AUTH: {
      REGISTER: "/api/v1/auth/register",
      LOGIN: "/api/v1/auth/login",
      LOGOUT: "/api/v1/auth/logout",
      VERIFY_EMAIL: "/api/v1/auth/verify-email",
      RESEND_VERIFICATION: "/api/v1/auth/resend-verification",
      FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
      RESET_PASSWORD: "/api/v1/auth/reset-password",
    },
    USER: {
      PROFILE: "/api/v1/user/profile",
      UPDATE_PROFILE: "/api/v1/user/profile",
      UPLOAD_PICTURE: "/api/v1/user/profile-picture",
      DELETE_PICTURE: "/api/v1/user/profile-picture",
      UPLOAD_RESUME: "/api/v1/user/upload-resume",
    },
    CONTACT: {
      SEND: "/api/v1/contact",
    },
  },
};

/**
 * Helper function to build full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Current environment
 */
export const IS_DEVELOPMENT = isDevelopment;
export const IS_PRODUCTION = !isDevelopment;

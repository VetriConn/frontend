/**
 * API Module Barrel Export
 * Re-exports all API functions for backward compatibility with `@/lib/api` imports
 */

// Auth
export {
  loginUser,
  logoutUser,
  registerUser,
  uploadResume,
  resendVerificationEmail,
} from "./auth";
export type { ApiResponse, RegisterResponse } from "./auth";

// Client utilities
export { storeAuthToken, getAuthToken, removeAuthToken } from "./client";

// Profile
export {
  getUserProfile,
  patchUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} from "./profile";

// Jobs
export {
  getJobs,
  getJobById,
  submitJobApplication,
  saveJob,
  unsaveJob,
} from "./jobs";

// Contact
export { sendContactMessage } from "./contact";

// Settings & Account
export {
  changePassword,
  requestDataExport,
  deactivateAccount,
  updateUserSettings,
} from "./settings";

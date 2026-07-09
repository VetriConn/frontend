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
  requestPasswordReset,
  resetPasswordWithToken,
} from "./auth";
export type { ApiResponse, RegisterResponse } from "./auth";

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
  getMyApplications,
  saveJob,
  unsaveJob,
  getSavedJobs,
  getRecommendedJobs,
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

// Notifications
export {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearNotifications,
} from "./notifications";

// Employer
export {
  getEmployerJobs,
  getEmployerJobById,
  getEmployerApplications,
  createEmployerJob,
  updateEmployerJob,
  deleteEmployerJob,
  updateEmployerApplicationStatus,
  uploadEmployerCompanyAsset,
  getEmployerMessageThreads,
  getEmployerThreadMessages,
  sendEmployerMessage,
  sendEmployerAttachmentMessage,
} from "./employer";

// Job Seeker Messaging
export {
  getJobSeekerMessageThreads,
  getJobSeekerThreadMessages,
  sendJobSeekerMessage,
  sendJobSeekerAttachmentMessage,
} from "./jobseeker";

// Job Seeker Drafts
export {
  getDrafts,
  getDraft,
  upsertDraft,
  deleteDraft,
} from "./jobseeker";

// Job Seeker Saved Searches
export {
  getSavedSearches as getSavedSearchesApi,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  runSavedSearch,
} from "./jobseeker";

// Job Seeker Application Tracker
export {
  getTrackerEntries,
  createTrackerEntry,
  updateTrackerEntry,
  deleteTrackerEntry,
} from "./jobseeker";

// Attachments
export {
  uploadAttachment,
  getUserAttachments,
  updateAttachment,
  deleteAttachment,
} from "./attachments";

// Direct Uploads
export {
  getUploadSignature,
  uploadDirectToCloudinary,
} from "./upload";
export type { CloudinaryUploadResponse, SignatureData } from "./upload";

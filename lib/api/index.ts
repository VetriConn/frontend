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
} from "./employer";

// Job Seeker Messaging
export {
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

// Job scraper (admin)
export { triggerJobScrape } from "./jobs";
export type { ScraperSourceSummary } from "./jobs";

// Company Pages
export {
  applyForCompany,
  getMyCompanies,
  getCompanyById,
  updateCompany,
  uploadCompanyLogo,
  uploadCompanyBanner,
  inviteMember,
  acceptInvite,
  removeMember,
  getCompanyJobs,
  adminListCompanies,
  adminApproveCompany,
  adminRejectCompany,
  getMyRole,
  canPostJobsFor,
} from "./companies";
export type {
  Company,
  CompanyMember,
  CompanyRole,
  CompanyMemberStatus,
  CompanyStatus,
  CompanyProfileInput,
  ApplyForCompanyInput,
} from "./companies";

export * from "./messages";

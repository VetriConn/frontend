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

// Postings
export {
  getMyPostings,
  getMyPosting,
  getReceivedApplications,
  createPosting,
  updatePosting,
  deletePosting,
  updateApplicationStatus,
} from "./postings";

// Job Seeker Messaging
export {
} from "./job-search";

// Job Seeker Drafts
export {
  getDrafts,
  getDraft,
  upsertDraft,
  deleteDraft,
} from "./job-search";

// Job Seeker Saved Searches
export {
  getSavedSearches as getSavedSearchesApi,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  runSavedSearch,
} from "./job-search";

// Job Seeker Application Tracker
export {
  getTrackerEntries,
  createTrackerEntry,
  updateTrackerEntry,
  deleteTrackerEntry,
} from "./job-search";

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
  transferOwnership,
  getCompanyJobs,
  getPublicCompanyJobs,
  type PublicCompanyJob,
  adminListCompanies,
  adminApproveCompany,
  adminRejectCompany,
  adminSuspendCompany,
  adminReinstateCompany,
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
export { getSkillSuggestions } from "./skills";
export { getReceivedApplication } from "./postings";
export type {
  CandidateProfile,
  ReceivedApplicationDetail,
} from "./postings";

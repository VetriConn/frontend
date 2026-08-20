import type { JobSeekingStatus } from "@/components/pages/profile/ProfileHeader";
/**
 * API Response Types
 * Types for API request/response data structures
 */

// Base API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Login response
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      role?: string;
    };
    token: string;
  };
  /** Set when the user has 2FA enabled. Frontend must call /2fa/challenge
   * with the partial-session token before a full session is issued. */
  requires2FA?: boolean;
  /**
   * Short-lived token issued alongside `requires2FA`. The frontend stores
   * it in memory only (no localStorage) and includes it on the challenge
   * request so the backend can match the partial session.
   */
  partialSessionToken?: string;
  error?: string;
}

// Signup response
export interface SignupResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
    };
    token: string;
  };
  error?: string;
}

// User socials structure
export interface UserSocials {
  linkedin?: string;
  twitter?: string;
  github?: string;
}

// Work experience entry
export interface WorkExperience {
  company: string;
  position: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

// Education entry
export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_year?: string;
  end_year?: string;
  description?: string;
  location?: string;
}

// Certification entry
export interface Certification {
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
}

// User document (resume, certificate, etc.)
export interface UserDocument {
  _id?: string;
  name: string;
  url: string;
  file_type?: string;
  type?: string;
  file_size?: number;
  upload_date?: Date | string;
  description?: string;
  document_type?: string; // 'resume', 'certificate', etc.
}

// User attachment
export interface UserAttachment {
  _id?: string;
  name: string;
  url: string;
  file_type?: string;
  file_size?: number;
  upload_date?: Date | string;
  description?: string;
}

// Complete User Profile Interface (matches backend IUser)
export interface UserProfile {
  /**
   * The user's own id. The profile endpoint has always returned this
   * (`id: user._id.toString()`); it just wasn't declared here. Needed to work
   * out the viewer's role on a company from its members list.
   */
  id?: string;
  full_name: string;
  role: string;
  email: string;
  picture?: string;
  password?: string;

  // Contact Information
  phone_number?: string;
  location?: string;
  city?: string;
  /** Province or state. ISO 3166-2 code where we enumerate them. */
  state_province?: string;
  country?: string;

  // Work Background
  job_title?: string;
  industry?: string;
  years_of_experience?: string;

  // Profile fields
  bio?: string;
  promotional_emails?: boolean;
  looking_for?: string[];
  documents?: UserDocument[];
  attachments?: UserAttachment[];
  socials?: UserSocials;
  work_experience?: WorkExperience[];
  education?: Education[];
  certifications?: Certification[];
  saved_jobs?: string[];
  applied_jobs_count?: number;
  skills?: string[];

  // Job-seeking status

  // Email verification fields
  emailVerified?: boolean;

  // Admin elevation flag — only meaningful when role === "admin".
  is_super_admin?: boolean;

  // Two-factor enabled (set by /2fa/verify, cleared by /2fa/disable).
  two_factor_enabled?: boolean;

  // Job seeker settings
  /**
   * One set for the whole account. The keys describe the person rather than a
   * role: application_updates is news about applications you sent,
   * posting_updates and new_applications are about jobs you posted.
   */
  notification_preferences?: {
    email_notifications: boolean;
    job_alerts: boolean;
    application_updates: boolean;
    posting_updates: boolean;
    new_applications: boolean;
    messages: boolean;
    community_updates: boolean;
  };
  privacy_preferences?: {
    profile_visibility: "everyone" | "employers-only" | "private";
  };
  job_seeking_settings?: {
    status: JobSeekingStatus;
    preferred_work_type: "remote" | "on-site" | "hybrid" | "no-preference";
    preferred_location: "within-10" | "within-25" | "within-50" | "anywhere";
    experience_level: "entry" | "mid" | "senior" | "executive";
  };
}

// User profile response from API (matches backend UserProfileResponse)
export interface UserProfileResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      full_name: string;
      email: string;
      role: string;
      phone_number?: string;
      city?: string;
      country?: string;
      job_title?: string;
      industry?: string;
      years_of_experience?: string;
      bio?: string;
      looking_for?: string[];
      picture?: string;
      socials?: UserSocials;
      work_experience?: WorkExperience[];
      education?: Education[];
      certifications?: Certification[];
      saved_jobs?: string[];
      applied_jobs_count?: number;
      skills?: string[];
      attachments?: UserAttachment[];
      documents?: UserDocument[];
    };
  };
}

// Jobs API Response types - Direct array response from backend
export interface JobsResponse {
  _id: string;
  id: string;
  role: string;
  company_name: string;
  company_logo?: string;
  location?: string;
  salary: {
    symbol: string;
    number: number;
    currency: string;
  };
  salary_range?: {
    start_salary: {
      symbol: string;
      number?: number;
      currency: string;
    };
    end_salary: {
      symbol: string;
      number?: number;
      currency: string;
    };
  };
  tags?: string[];
  full_description?: string;
  responsibilities?: string[];
  qualifications?: string[];
  applicationLink?: string;
  description?: string;
  application_count?: number;

  // Aggregated listings. Scraped jobs have no employer behind them — the real
  // posting lives at external_url and applications must go there, not through
  // our application flow.
  source?: "user" | "scraped";
  source_name?: string;
  external_url?: string;
  /** Free-text salary straight from the source, e.g. "$18.50 hourly". */
  salary_text?: string;

  // Company-posted jobs (vetted Company Pages).
  posted_as?: "individual" | "company";
  company_id?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ApplicationItem {
  _id: string;
  user_id: string;
  job_id:
    | string
    | {
        _id: string;
        id: string;
        role: string;
        company_name: string;
        location?: string;
        company_logo?: string;
      };
  status: "pending" | "reviewed" | "accepted" | "rejected";
  full_name: string;
  email: string;
  phone: string;
  relevant_experience?: string;
  selected_skills?: string[];
  earliest_start_date?: string;
  preferred_schedule?: string;
  work_location_preference?: string;
  resume_url?: string;
  additional_info?: string;
  applied_at: string;
  createdAt?: string;
  updatedAt?: string;
}

export type EmployerMessageSender = "employer" | "applicant";

export interface EmployerThreadSummary {
  application_id: string;
  applicant: {
    user_id?: string;
    full_name: string;
    email: string;
    phone: string;
  };
  job: {
    role: string;
    company_name: string;
  };
  selected_skills?: string[];
  additional_info?: string;
  applied_at?: string;
  last_message?: {
    _id: string;
    sender: EmployerMessageSender;
    content: string;
    attachment_url?: string;
    attachment_name?: string;
    attachment_mime_type?: string;
    attachment_size?: number;
    createdAt: string;
  } | null;
}

export interface EmployerThreadMessage {
  _id: string;
  application_id: string;
  employer_id: string;
  applicant_id: string;
  sender: EmployerMessageSender;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_mime_type?: string;
  attachment_size?: number;
  read_by_employer: boolean;
  read_by_applicant: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployerThreadDetail {
  application_id: string;
  applicant: {
    user_id?: string;
    full_name: string;
    email: string;
    phone: string;
  };
  job: {
    role: string;
    company_name: string;
  };
  selected_skills?: string[];
  additional_info?: string;
  applied_at?: string;
}

// Job Seeker Messaging Types
/**
 * Mirrors the server's Message.sender enum, which stores "applicant" —
 * NOT "job_seeker". Declared per-side here because the two repos share no
 * package; keep it identical to MessageSender in backend/src/types/Message.ts.
 * Getting this wrong renders a seeker's own messages as the employer's.
 */
export type JobSeekerMessageSender = "employer" | "applicant";

export interface JobSeekerThreadMessage {
  _id: string;
  application_id: string;
  sender: JobSeekerMessageSender;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_mime_type?: string;
  attachment_size?: number;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType =
  | "application_sent"
  | "application_received"
  | "application_reviewed"
  | "job_match"
  | "profile_reminder"
  | "profile_viewed"
  | "new_reply"
  | "employer_message"
  | "system";

export interface NotificationItem {
  _id: string;
  type: NotificationType;
  title: string;
  description: string;
  link?: string;
  is_read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface EmployerJobSummary {
  _id: string;
  id: string;
  role: string;
  company_name: string;
  location?: string;
  status?: "draft" | "published";
  application_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployerDraftPayload {
  job_title?: string;
  job_category?: string;
  job_type?: string;
  employment_type?: string;
  description?: string;
  experience_level?: string;
  skills?: string;
  physical_demands?: string;
  salary_min?: string;
  salary_max?: string;
  payment_type?: string;
  city?: string;
  /** Province or state. ISO 3166-2 code where we enumerate them. */
  state_province?: string;
  country?: string;
  work_schedule?: string;
}

export interface EmployerJobDetail extends EmployerJobSummary {
  description?: string;
  full_description?: string;
  tags?: string[];
  qualifications?: string[];
  responsibilities?: string[];
  company_logo?: string;
  salary?: {
    number: number;
    currency: string;
    symbol: string;
  };
  salary_range?: {
    start_salary?: {
      number?: number;
      currency?: string;
      symbol?: string;
    };
    end_salary?: {
      number?: number;
      currency?: string;
      symbol?: string;
    };
  };
  draft_payload?: EmployerDraftPayload;
}

// Attachment types (matching backend schema)
export interface Attachment {
  _id?: string; // MongoDB ID when fetched from backend
  name: string;
  url: string;
  file_type?: string; // "pdf", "doc", "docx"
  file_size?: number; // in bytes
  upload_date?: string; // ISO date string
  description?: string;
  // For compatibility with existing frontend code
  id?: string; // Will map from _id
  type?: string; // Will map from file_type
  size?: number; // Will map from file_size
  uploadedAt?: string; // Will map from upload_date
  preview?: string; // Optional preview URL
}

export interface AttachmentUploadResponse {
  success: boolean;
  message: string;
  data?: {
    attachments: Attachment[];
  };
  error?: string;
}

export interface AttachmentsListResponse {
  success: boolean;
  message: string;
  data?: {
    attachments: Attachment[];
  };
  error?: string;
}

// Backend attachment type (internal)
export interface BackendAttachment {
  _id?: string;
  id?: string;
  name: string;
  url: string;
  file_type?: string;
  file_size?: number;
  upload_date?: string;
  description?: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
  preview?: string;
}

// Message/Contact form types
export interface ContactMessage {
  full_name: string;
  email: string;
  message: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
  data?: {
    sent: boolean;
  };
  errors?: {
    field: string;
    message: string;
  }[];
}

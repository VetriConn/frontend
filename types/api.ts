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
  full_name: string;
  role: string;
  email: string;
  picture?: string;
  password?: string;

  // Contact Information
  phone_number?: string;
  location?: string;
  city?: string;
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
  employer_profile?: {
    company_name: string;
    industry: string;
    city: string;
    country: string;
    phone_number?: string;
    company_email?: string;
    website?: string;
    company_size?: string;
    about_company?: string;
    logo_url?: string;
    banner_url?: string;
    notification_preferences: {
      email_notifications: boolean;
      job_approved_rejected: boolean;
      new_applications: boolean;
      messages: boolean;
    };
    company_preferences: {
      public_company_profile: boolean;
      show_contact_information: boolean;
    };
  };

  // Job-seeking status
  job_seeking_status?:
    | "none"
    | "actively_looking"
    | "open_to_offers"
    | "not_looking";

  // Email verification fields
  emailVerified?: boolean;
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
      employer_profile?: {
        company_name: string;
        industry: string;
        city: string;
        country: string;
        phone_number?: string;
        company_email?: string;
        website?: string;
        company_size?: string;
        about_company?: string;
        logo_url?: string;
        banner_url?: string;
        notification_preferences: {
          email_notifications: boolean;
          job_approved_rejected: boolean;
          new_applications: boolean;
          messages: boolean;
        };
        company_preferences: {
          public_company_profile: boolean;
          show_contact_information: boolean;
        };
      };
      job_seeking_status?:
        | "none"
        | "actively_looking"
        | "open_to_offers"
        | "not_looking";
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

export interface NotificationItem {
  _id: string;
  type:
    | "application_sent"
    | "application_received"
    | "application_reviewed"
    | "job_match"
    | "profile_reminder"
    | "system";
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
  application_count?: number;
  createdAt?: string;
  updatedAt?: string;
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

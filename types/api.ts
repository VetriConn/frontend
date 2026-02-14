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
  city?: string;
  country?: string;
  location?: string;
  
  // Work Background
  job_title?: string;
  industry?: string;
  years_of_experience?: string;
  
  // Profile fields
  profession?: string;
  bio?: string;
  current_job?: string;
  experience?: string;
  promotional_emails?: boolean;
  looking_for?: string[];
  documents?: UserDocument[];
  attachments?: UserAttachment[];
  socials?: UserSocials;
  professional_summary?: string;
  work_experience?: WorkExperience[];
  education?: Education[];
  certifications?: Certification[];
  saved_jobs?: string[];
  
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
      location?: string;
      job_title?: string;
      industry?: string;
      years_of_experience?: string;
      profession?: string;
      bio?: string;
      current_job?: string;
      experience?: string;
      looking_for?: string[];
      picture?: string;
      socials?: UserSocials;
      professional_summary?: string;
      work_experience?: WorkExperience[];
      education?: Education[];
      certifications?: Certification[];
      saved_jobs?: string[];
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
  createdAt: string;
  updatedAt: string;
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
  description: string;
}

export interface MessageResponse {
  success: boolean;
  description: string;
  data?: {
    id: string;
    full_name: string;
    email: string;
    description: string;
    createdAt: string;
  };
  error?: string;
}


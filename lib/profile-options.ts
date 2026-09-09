/**
 * Profile dropdown vocabularies, deliberately zod-free: importing them from
 * lib/validation dragged the whole zod schema graph into any route that just
 * needed dropdown options (the profile page's chunk shrank measurably).
 * lib/validation re-exports both for compatibility.
 */

// Experience levels for dropdown (standardized format matching profile settings)
export const EXPERIENCE_LEVELS = [
  { value: "0-2 years", label: "0\u20132 years" },
  { value: "3-5 years", label: "3\u20135 years" },
  { value: "6-10 years", label: "6\u201310 years" },
  { value: "11-15 years", label: "11\u201315 years" },
  { value: "16-20 years", label: "16\u201320 years" },
  { value: "20+ years", label: "20+ years" },
];

// Industry options for job seekers (standardized format matching profile settings)
export const INDUSTRY_OPTIONS = [
  { value: "Government & Public Administration", label: "Government & Public Administration" },
  { value: "Defence & Military", label: "Defence & Military" },
  { value: "Healthcare & Medical", label: "Healthcare & Medical" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Engineering", label: "Engineering" },
  { value: "Logistics & Supply Chain", label: "Logistics & Supply Chain" },
  { value: "Education & Training", label: "Education & Training" },
  { value: "Construction & Trades", label: "Construction & Trades" },
  { value: "Finance & Accounting", label: "Finance & Accounting" },
  { value: "Law Enforcement & Security", label: "Law Enforcement & Security" },
  { value: "Transportation", label: "Transportation" },
  { value: "Telecommunications", label: "Telecommunications" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Non-profit & Community", label: "Non-profit & Community" },
  { value: "Other", label: "Other" },
];

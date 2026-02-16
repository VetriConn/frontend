/**
 * Profile Completion Utilities
 * Single source of truth for calculating profile completion.
 * Used by: useUserProfile hook, ProfileCompletionCard, CompleteProfileCard, ProfileHeader badge.
 */

import { UserProfile } from "@/types/api";

export interface CompletionItem {
  field: string;
  label: string;
  /** Element ID on the profile page to scroll to */
  scrollTo: string;
}

export interface CompletionStatus {
  percentage: number;
  completed: number;
  total: number;
  completedSections: string[];
  incompleteSections: string[];
  items: (CompletionItem & { isComplete: boolean })[];
}

/**
 * The list of fields a user should complete.
 * Every field here helps us tailor job recommendations to the user.
 */
export const PROFILE_COMPLETION_FIELDS: CompletionItem[] = [
  { field: "full_name", label: "Full Name", scrollTo: "profile-header" },
  { field: "picture", label: "Profile Photo", scrollTo: "profile-header" },
  {
    field: "phone_number",
    label: "Phone Number",
    scrollTo: "contact-info-card",
  },
  { field: "location", label: "Location", scrollTo: "contact-info-card" },
  { field: "bio", label: "Professional Bio", scrollTo: "profile-header" },
  {
    field: "job_title",
    label: "Job Title",
    scrollTo: "professional-info-card",
  },
  { field: "industry", label: "Industry", scrollTo: "professional-info-card" },
  {
    field: "years_of_experience",
    label: "Years of Experience",
    scrollTo: "professional-info-card",
  },
  {
    field: "work_experience",
    label: "Work Experience",
    scrollTo: "work-experience-card",
  },
  { field: "education", label: "Education", scrollTo: "education-card" },
  {
    field: "documents",
    label: "Resume / Documents",
    scrollTo: "documents-card",
  },
  {
    field: "skills",
    label: "Skills",
    scrollTo: "skills-card",
  },
];

/**
 * Check whether a single profile field is considered "filled".
 */
function isFieldFilled(profile: UserProfile, field: string): boolean {
  const value = profile[field as keyof UserProfile];
  if (
    field === "documents" ||
    field === "work_experience" ||
    field === "education" ||
    field === "skills"
  ) {
    return Array.isArray(value) && value.length > 0;
  }
  if (field === "picture") {
    // Picture must be a real URL, not empty
    if (typeof value !== "string") return false;
    return value.trim() !== "";
  }
  if (field === "location") {
    // location can be derived from city + country
    const loc = profile.location || "";
    const city = profile.city || "";
    const country = profile.country || "";
    return loc.trim() !== "" || (city.trim() !== "" && country.trim() !== "");
  }
  if (typeof value === "string") {
    return value.trim() !== "";
  }
  return value !== undefined && value !== null;
}

/**
 * Calculate profile completion percentage and section status.
 *
 * @param profile - User profile object (from API or mapped)
 * @returns CompletionStatus with percentage, counts, and per-item status
 */
export function calculateProfileCompletion(
  profile: UserProfile,
): CompletionStatus {
  const completedSections: string[] = [];
  const incompleteSections: string[] = [];

  const items = PROFILE_COMPLETION_FIELDS.map((item) => {
    const isComplete = isFieldFilled(profile, item.field);
    if (isComplete) {
      completedSections.push(item.field);
    } else {
      incompleteSections.push(item.field);
    }
    return { ...item, isComplete };
  });

  const total = PROFILE_COMPLETION_FIELDS.length;
  const completed = completedSections.length;
  const percentage = Math.round((completed / total) * 100);

  return {
    percentage,
    completed,
    total,
    completedSections,
    incompleteSections,
    items,
  };
}

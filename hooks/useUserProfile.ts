import useSWR from "swr";
import { getUserProfile } from "@/lib/api";

// Profile completion step groups (matching signup wizard structure)
const PROFILE_STEP_GROUPS = [
  { name: "Account Type", fields: ["role"] },
  { name: "Personal Info", fields: ["full_name"] },
  { name: "Contact Info", fields: ["phone_number", "city", "country"] },
  {
    name: "Work Background",
    fields: ["job_title", "industry", "years_of_experience"],
  },
  { name: "Resume Upload", fields: ["documents"] },
] as const;

// Get all fields for percentage calculation
const ALL_PROFILE_FIELDS = PROFILE_STEP_GROUPS.flatMap((step) => step.fields);

export function useUserProfile() {
  const { data, error, mutate, isLoading } = useSWR(
    "/auth/profile",
    getUserProfile,
  );

  const rawUser = data?.data?.user;

  // Calculate profile completion based on step groups
  const profileCompletion = (() => {
    if (!rawUser)
      return { percentage: 0, completed: 0, total: PROFILE_STEP_GROUPS.length };

    // Check if a field has data
    const isFieldFilled = (field: string): boolean => {
      const value = rawUser[field as keyof typeof rawUser];
      if (field === "documents") {
        return Array.isArray(value) && value.length > 0;
      }
      return (
        value !== undefined && value !== null && String(value).trim() !== ""
      );
    };

    // Count completed steps (all fields in group must be filled)
    const completedSteps = PROFILE_STEP_GROUPS.filter((step) =>
      step.fields.every((field) => isFieldFilled(field)),
    ).length;

    // Calculate percentage based on individual fields filled
    const filledFields = ALL_PROFILE_FIELDS.filter((field) =>
      isFieldFilled(field),
    ).length;
    const percentage = Math.round(
      (filledFields / ALL_PROFILE_FIELDS.length) * 100,
    );

    return {
      percentage,
      completed: completedSteps,
      total: PROFILE_STEP_GROUPS.length,
    };
  })();

  // Map backend user data to frontend format with proper fallbacks
  const userProfile = rawUser
    ? {
        name: rawUser.full_name || "User",
        title: rawUser.profession || "",
        role: rawUser.role || "job_seeker",
        location: rawUser.location || "",
        experience: rawUser.experience || "",
        current: rawUser.current_job || "",
        lookingFor: rawUser.looking_for || [],
        bio: rawUser.bio || null,
        avatar:
          rawUser.picture &&
          rawUser.picture.trim() &&
          rawUser.picture.trim() !== "/images/richmond.svg"
            ? rawUser.picture.trim()
            : "",
        socials: {
          linkedin: rawUser.socials?.linkedin || "",
          twitter: rawUser.socials?.twitter || "",
          github: rawUser.socials?.github || "",
        },
        professionalSummary: rawUser.professional_summary || "",
        // Additional fields for profile completion
        phone_number: rawUser.phone_number || "",
        city: rawUser.city || "",
        country: rawUser.country || "",
        job_title: rawUser.job_title || "",
        industry: rawUser.industry || "",
        years_of_experience: rawUser.years_of_experience || "",
        // Pass through arrays and email for profile page
        work_experience: rawUser.work_experience || [],
        education: rawUser.education || [],
        documents: rawUser.documents || [],
        saved_jobs: rawUser.saved_jobs || [],
        email: rawUser.email || "",
      }
    : null;

  return {
    userProfile,
    rawUser,
    profileCompletion,
    isLoading,
    isError: !!error,
    mutateProfile: mutate,
  };
}

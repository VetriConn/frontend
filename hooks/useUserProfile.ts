import useSWR from "swr";
import { getUserProfile } from "@/lib/api";
import {
  calculateProfileCompletion,
  PROFILE_COMPLETION_FIELDS,
} from "@/lib/profile-utils";
import type { UserProfile } from "@/types/api";

export function useUserProfile() {
  const { data, error, mutate, isLoading } = useSWR(
    "/auth/profile",
    getUserProfile,
  );

  const rawUser = data?.data?.user;

  // Build an API-shaped UserProfile for the unified completion calculator
  const apiProfile: UserProfile | null = rawUser
    ? {
        full_name: rawUser.full_name || "",
        role: rawUser.role || "job_seeker",
        email: rawUser.email || "",
        phone_number: rawUser.phone_number || "",
        city: rawUser.city || "",
        country: rawUser.country || "",
        location: rawUser.location || "",
        job_title: rawUser.job_title || "",
        industry: rawUser.industry || "",
        years_of_experience: rawUser.years_of_experience || "",
        bio: rawUser.bio || "",
        profession: rawUser.profession || "",
        picture: rawUser.picture || "",
        work_experience: rawUser.work_experience || [],
        education: rawUser.education || [],
        documents: rawUser.documents || [],
        socials: rawUser.socials || {},
        professional_summary: rawUser.professional_summary || "",
        saved_jobs: rawUser.saved_jobs || [],
        skills: rawUser.skills || [],
        job_seeking_status: rawUser.job_seeking_status || "none",
      }
    : null;

  // Single source of truth for profile completion
  const profileCompletion = apiProfile
    ? calculateProfileCompletion(apiProfile)
    : {
        percentage: 0,
        completed: 0,
        total: PROFILE_COMPLETION_FIELDS.length,
        completedSections: [],
        incompleteSections: [],
        items: [],
      };

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
          rawUser.picture && rawUser.picture.trim()
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
        skills: rawUser.skills || [],
        job_seeking_status: rawUser.job_seeking_status || "none",
        email: rawUser.email || "",
      }
    : null;

  return {
    userProfile,
    rawUser,
    apiProfile,
    profileCompletion,
    isLoading,
    isError: !!error,
    mutateProfile: mutate,
  };
}

import useSWR from "swr";
import { getUserProfile } from "@/lib/api";
import type { UserProfile } from "@/types/api";
import {
  calculateProfileCompletion,
  PROFILE_COMPLETION_FIELDS,
} from "@/lib/profile-utils";

export function useUserProfile() {
  const { data, error, mutate, isLoading } = useSWR(
    "/auth/profile",
    getUserProfile,
  );

  const userProfile: UserProfile | null = data?.data?.user ?? null;

  // Single source of truth for profile completion
  const profileCompletion = userProfile
    ? calculateProfileCompletion(userProfile)
    : {
        percentage: 0,
        completed: 0,
        total: PROFILE_COMPLETION_FIELDS.length,
        completedSections: [],
        incompleteSections: [],
        items: [],
      };

  return {
    userProfile,
    profileCompletion,
    isLoading,
    isError: !!error,
    mutateProfile: mutate,
  };
}

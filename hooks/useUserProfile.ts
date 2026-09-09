import useSWR from "swr";
import { getUserProfile } from "@/lib/api";
import type { UserProfile } from "@/types/api";
import {
  calculateProfileCompletion,
  PROFILE_COMPLETION_FIELDS,
} from "@/lib/profile-utils";

/** The one SWR key for the signed-in profile. Shared so a seed written by
 *  the sign-in flow lands where this hook reads. */
export const PROFILE_KEY = "/auth/profile";

export function useUserProfile() {
  const { data, error, mutate, isLoading } = useSWR(
    PROFILE_KEY,
    getUserProfile,
    {
      // The header renders off this, so every revalidation repaints the auth
      // CTA. Refetching on each window focus made the Sign In / Dashboard
      // button visibly flash on public pages. Sign-in and sign-out call
      // mutate() directly, so the session stays correct without polling it.
      revalidateOnFocus: false,
      keepPreviousData: true,
      // Signed out, this endpoint answers 401 by design — retrying it five
      // times per page is noise, and each retry re-enters the loading state.
      shouldRetryOnError: false,
      dedupingInterval: 60_000,
    },
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

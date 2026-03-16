import { useState } from "react";
import { useRouter } from "next/navigation";
import { patchUserProfile } from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import type { UserProfile, UserProfileResponse } from "@/types/api";

function getProfileUpdateToastContent(data: Partial<UserProfile>) {
  const keys = Object.keys(data);

  const matchesExactly = (...expectedKeys: string[]) =>
    keys.length === expectedKeys.length &&
    expectedKeys.every((key) => keys.includes(key));

  if (matchesExactly("skills")) {
    return {
      title: "Skills updated",
      description: "Your skills have been updated successfully",
    };
  }

  if (matchesExactly("work_experience")) {
    return {
      title: "Work experience updated",
      description: "Your work experience has been updated successfully",
    };
  }

  if (matchesExactly("education")) {
    return {
      title: "Education updated",
      description: "Your education has been updated successfully",
    };
  }

  if (
    matchesExactly("full_name", "bio") ||
    matchesExactly("full_name") ||
    matchesExactly("bio")
  ) {
    return {
      title: "Public profile updated",
      description: "Your public profile has been updated successfully",
    };
  }

  if (keys.every((key) => ["phone_number", "city", "country"].includes(key))) {
    return {
      title: "Contact info updated",
      description: "Your contact information has been updated successfully",
    };
  }

  if (
    keys.every((key) =>
      ["job_title", "industry", "years_of_experience"].includes(key),
    )
  ) {
    return {
      title: "Professional info updated",
      description:
        "Your professional information has been updated successfully",
    };
  }

  return {
    title: "Profile updated",
    description: "Your profile has been updated successfully",
  };
}

interface UsePatchProfileReturn {
  patchProfile: (data: Partial<UserProfile>) => Promise<UserProfileResponse>;
  isLoading: boolean;
  error: string | null;
}

export function usePatchProfile(
  onSuccess?: (data: UserProfileResponse) => void,
): UsePatchProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToaster();
  const router = useRouter();

  const patchProfile = async (
    data: Partial<UserProfile>,
  ): Promise<UserProfileResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await patchUserProfile(data);
      const toastContent = getProfileUpdateToastContent(data);

      // Show success toast
      showToast({
        type: "success",
        title: toastContent.title,
        description: toastContent.description,
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response);
      }

      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);

      // Handle session expiration (401)
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        showToast({
          type: "error",
          title: "Session expired",
          description: "Please log in again",
        });
        router.push("/signin");
      }

      // Show error toast
      showToast({
        type: "error",
        title: "Update failed",
        description: errorMessage,
      });

      setIsLoading(false);
      throw err instanceof Error ? err : new Error(errorMessage);
    }
  };

  return {
    patchProfile,
    isLoading,
    error,
  };
}

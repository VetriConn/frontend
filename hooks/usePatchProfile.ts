import { useState } from "react";
import { useRouter } from "next/navigation";
import { patchUserProfile } from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import type { UserProfile, UserProfileResponse } from "@/types/api";

interface UsePatchProfileReturn {
  patchProfile: (data: Partial<UserProfile>) => Promise<UserProfileResponse | null>;
  isLoading: boolean;
  error: string | null;
}

export function usePatchProfile(onSuccess?: (data: UserProfileResponse) => void): UsePatchProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToaster();
  const router = useRouter();

  const patchProfile = async (data: Partial<UserProfile>): Promise<UserProfileResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await patchUserProfile(data);

      // Show success toast
      showToast({
        type: "success",
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response);
      }

      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);

      // Handle session expiration (401)
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        showToast({
          type: "error",
          title: "Session expired",
          description: "Please log in again",
        });
        router.push("/signin");
        setIsLoading(false);
        return null;
      }

      // Show error toast
      showToast({
        type: "error",
        title: "Update failed",
        description: errorMessage,
      });

      setIsLoading(false);
      return null;
    }
  };

  return {
    patchProfile,
    isLoading,
    error,
  };
}

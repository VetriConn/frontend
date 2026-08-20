"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * RoleGuard - Protects routes based on user role
 *
 * Usage:
 * <RoleGuard allowedRoles={["employer"]}>
 *   <EmployerOnlyContent />
 * </RoleGuard>
 */
export function RoleGuard({
  allowedRoles,
  children,
  redirectTo,
}: RoleGuardProps) {
  const { userProfile, isLoading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && userProfile) {
      const userRole = userProfile.role;

      if (!allowedRoles.includes(userRole)) {
        // Redirect based on user role
        if (redirectTo) {
          router.replace(redirectTo);
        } else {
          // Default redirects based on role
          if (userRole === "employer") {
            router.replace("/dashboard/notifications");
          } else if (userRole === "job_seeker") {
            router.replace("/dashboard/notifications");
          } else {
            router.replace("/dashboard");
          }
        }
      }
    }
  }, [userProfile, isLoading, allowedRoles, redirectTo, router]);

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render content if user doesn't have permission
  if (!userProfile || !allowedRoles.includes(userProfile.role)) {
    return null;
  }

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Restrict to admins. Everything else is open to any signed-in account. */
  adminOnly?: boolean;
  redirectTo?: string;
}

/**
 * Requires a signed-in account.
 *
 * This replaces the role gates the dashboard used to carry. There is one
 * account type now — the same person applies to jobs and posts them — so
 * "employer pages" and "job seeker pages" no longer describe anything. The
 * only real distinction left is admin.
 *
 * Authorization proper lives on the server, which scopes every query by the
 * caller's id. This is presentation: it keeps people out of pages that would
 * be empty for them, and is not the security boundary.
 */
export function AuthGuard({
  children,
  adminOnly = false,
  redirectTo,
}: AuthGuardProps) {
  const { userProfile, isLoading } = useUserProfile();
  const router = useRouter();

  const permitted = !adminOnly || userProfile?.role === "admin";

  useEffect(() => {
    if (isLoading) return;

    if (!userProfile) {
      router.replace(redirectTo ?? "/signin");
      return;
    }

    if (!permitted) router.replace(redirectTo ?? "/dashboard");
  }, [userProfile, isLoading, permitted, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile || !permitted) return null;

  return <>{children}</>;
}

export default AuthGuard;

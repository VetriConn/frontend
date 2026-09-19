"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { withReturnUrl } from "@/lib/auth-redirect";

interface AuthGuardProps {
  children: React.ReactNode;
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
 *
 * It used to take `adminOnly` and `redirectTo`, and all seventeen call sites
 * are a bare `<AuthGuard>`, so neither had ever been set. `adminOnly`
 * predates the admin area having a layout of its own, and
 * app/(admin)/admin/layout.tsx does that gate inline now, which left the
 * `isAdmin` arm of the old permitted ternary with no caller that could reach
 * it. Two smaller things follow from that and are folded in below: with
 * `adminOnly` fixed false, `permitted` is just `!isAdmin`, so the one place
 * that bounced a non-permitted person was only ever bouncing an admin and
 * had no need to choose a destination.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { userProfile, isLoading } = useUserProfile();
  const router = useRouter();

  const isAdmin = userProfile?.role === "admin";
  // Admins are staff and don't participate as members, so the member dashboard
  // isn't theirs to use — the server refuses those endpoints outright
  // (middleware `denyAdmin`), and this keeps them out of the UI that calls them.
  const permitted = !isAdmin;

  useEffect(() => {
    if (isLoading) return;

    if (!userProfile) {
      // Carry the page they were heading to through the sign-in detour —
      // "Hiring? Post a job" must land on post-job after auth, not on the
      // generic dashboard. window.location is fine here: this runs only in
      // an effect, and it spares every guarded page a useSearchParams
      // Suspense boundary.
      const here = window.location.pathname + window.location.search;
      router.replace(withReturnUrl("/signin", here));
      return;
    }

    if (!permitted) {
      router.replace("/admin");
    }
  }, [userProfile, isLoading, permitted, router]);

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

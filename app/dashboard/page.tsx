"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

const FindJobsDashboard = dynamic(
  () => import("@/components/pages/dashboard/FindJobsDashboard"),
  { loading: () => <DashboardSkeleton /> },
);

/**
 * The dashboard home is job search, for everyone.
 *
 * There used to be a second dashboard chosen by role, listing the jobs you had
 * posted — but /dashboard/postings already does that, with editing and
 * pagination the landing page never had. So postings live there, reachable from
 * the nav, and this stays the one thing every account arrives wanting.
 */
const Dashboard = () => {
  const { userProfile, isLoading, isError } = useUserProfile();
  const router = useRouter();

  // Admins live under /admin.
  useEffect(() => {
    if (!isLoading && userProfile?.role === "admin") {
      router.replace("/admin");
    }
  }, [isLoading, userProfile?.role, router]);

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            We couldn&apos;t load your dashboard
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Please sign in again to continue.
          </p>
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Redirect above is in flight.
  if (userProfile.role === "admin") return <DashboardSkeleton />;

  return <FindJobsDashboard />;
};

export default Dashboard;

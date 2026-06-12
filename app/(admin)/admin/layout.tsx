"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/pages/admin/AdminSidebar";
import AdminTopBar from "@/components/pages/admin/AdminTopBar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { userProfile, isLoading, isError } = useUserProfile();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Client-side defense in depth — backend `authorizeRoles("admin")` is the
  // real boundary; this is just UX so non-admins don't see admin chrome.
  useEffect(() => {
    if (isLoading) return;
    if (isError || !userProfile) {
      router.replace("/signin");
      return;
    }
    if (userProfile.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, isError, userProfile, router]);

  if (isLoading || !userProfile || userProfile.role !== "admin") {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopBar onOpenMobileMenu={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

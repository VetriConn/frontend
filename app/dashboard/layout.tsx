import DashboardNavbar from "@/components/ui/DashboardNavbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TourProvider } from "@/components/tour/TourProvider";
import TourAutoStart from "@/components/tour/TourAutoStart";

import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Every dashboard route requires a signed-in member. The guard lives here
 * rather than on individual pages so a new page can't ship unguarded — and it
 * sends admin (staff) accounts to the admin console, since the member surface
 * isn't theirs and the API refuses those calls anyway.
 */
const layout = ({ children }: LayoutProps) => {
  return (
    <AuthGuard>
      {/*
        The provider wraps the whole dashboard so the tour can point at the
        navbar, and so Account Settings can start a replay without the tour
        living on that page.
      */}
      <TourProvider>
        <div className="min-h-screen bg-gray-50">
          <DashboardNavbar />
          <Breadcrumbs />
          <main id="main-content" className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </main>
        </div>
        <TourAutoStart />
      </TourProvider>
    </AuthGuard>
  );
};

export default layout;

import DashboardNavbar from "@/components/ui/DashboardNavbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AuthGuard } from "@/components/auth/AuthGuard";

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
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <Breadcrumbs />
        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
};

export default layout;

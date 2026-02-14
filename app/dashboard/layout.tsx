import { AuthFooter } from "@/components/ui/AuthFooter";
import DashboardNavbar from "@/components/ui/DashboardNavbar";



import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <DashboardNavbar />
      <div>
        {/* This is where the main content will be rendered */}
        {children}
      </div>
      <AuthFooter />
    </div>
  );
};

export default layout;

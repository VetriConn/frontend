import type { Metadata } from "next";
import ReportsQueue from "@/components/pages/admin/ReportsQueue";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

export default function AdminReportsPage() {
  return <ReportsQueue />;
}

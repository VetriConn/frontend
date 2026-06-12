import type { Metadata } from "next";
import SupportTickets from "@/components/pages/admin/SupportTickets";

export const metadata: Metadata = {
  title: "Support Tickets",
  robots: { index: false, follow: false },
};

export default function AdminSupportPage() {
  return <SupportTickets />;
}

import type { Metadata } from "next";
import AuditLog from "@/components/pages/admin/AuditLog";

export const metadata: Metadata = {
  title: "Audit Log",
  robots: { index: false, follow: false },
};

export default function AdminAuditLogPage() {
  return <AuditLog />;
}

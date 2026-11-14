import type { Metadata } from "next";
import AdminTelemetry from "@/components/pages/admin/AdminTelemetry";

export const metadata: Metadata = {
  title: "Traffic",
  robots: { index: false, follow: false },
};

export default function AdminTelemetryPage() {
  return <AdminTelemetry />;
}

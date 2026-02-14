import type { Metadata } from "next";
import {
  generateMetadata as generateSeoMetadata,
  METADATA_TEMPLATES,
} from "@/lib/seo";

export const metadata: Metadata = generateSeoMetadata({
  title: METADATA_TEMPLATES.jobs.title,
  description: METADATA_TEMPLATES.jobs.description,
  path: "/jobs",
  keywords: [
    "veteran jobs Canada",
    "retiree jobs",
    "senior employment",
    "part-time jobs veterans",
  ],
});

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

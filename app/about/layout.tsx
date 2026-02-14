import type { Metadata } from "next";
import {
  generateMetadata as generateSeoMetadata,
  METADATA_TEMPLATES,
} from "@/lib/seo";

export const metadata: Metadata = generateSeoMetadata({
  title: METADATA_TEMPLATES.about.title,
  description: METADATA_TEMPLATES.about.description,
  path: "/about",
  keywords: [
    "about Vetriconn",
    "veteran jobs Canada",
    "retiree employment mission",
    "Canadian workforce",
  ],
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

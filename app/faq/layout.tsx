import type { Metadata } from "next";
import {
  generateMetadata as generateSeoMetadata,
  METADATA_TEMPLATES,
} from "@/lib/seo";

export const metadata: Metadata = generateSeoMetadata({
  title: METADATA_TEMPLATES.faq.title,
  description: METADATA_TEMPLATES.faq.description,
  path: "/faq",
  keywords: [
    "Vetriconn FAQ",
    "veteran jobs questions",
    "retiree employment help",
    "senior jobs Canada",
  ],
});

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";
import { SignIn } from "@/components/pages/auth/SignIn";
import { generateMetadata as generateSeoMetadata, METADATA_TEMPLATES } from "@/lib/seo";

export const metadata: Metadata = generateSeoMetadata({
  title: METADATA_TEMPLATES.signin.title,
  description: METADATA_TEMPLATES.signin.description,
  path: "/signin",
});

export default function SignInPage() {
  return <SignIn />
}

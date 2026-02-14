import type { Metadata } from "next";
import { SignupWizard } from "@/components/pages/auth/signup/SignupWizard";
import { Suspense } from "react";
import { generateMetadata as generateSeoMetadata, METADATA_TEMPLATES } from "@/lib/seo";

export const metadata: Metadata = generateSeoMetadata({
  title: METADATA_TEMPLATES.signup.title,
  description: METADATA_TEMPLATES.signup.description,
  path: "/signup",
  keywords: ["register for senior jobs", "veteran job seeker signup", "retiree job registration"],
});

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupWizard />
    </Suspense>
  );
}

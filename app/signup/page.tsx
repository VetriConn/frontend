"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Lazy load SignupWizard for better code splitting
const SignupWizard = dynamic(
  () => import("@/components/pages/auth/signup/SignupWizard").then((mod) => ({ default: mod.SignupWizard })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFAF9]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    ),
  }
);

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FBFAF9]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupWizard />
    </Suspense>
  );
}

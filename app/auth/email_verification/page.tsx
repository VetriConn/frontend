"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthHeader } from "@/components/ui/AuthHeader";
import { getApiUrl } from "@/lib/api-config";
import Link from "next/link";

function VerifyingSpinner() {
  return (
    <>
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Verifying Your Email
      </h1>
      <p className="text-gray-600">
        Please wait while we verify your email address...
      </p>
    </>
  );
}

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(getApiUrl("/api/v1/auth/verify-email"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setMessage("Your email has been verified successfully!");

        setTimeout(() => {
          router.push("/auth/welcome");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(
          data.message ||
            "Verification failed. The link may be expired or invalid.",
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("An error occurred during verification. Please try again.");
    }
  };

  return (
    <>
      {status === "loading" && <VerifyingSpinner />}

      {status === "success" && (
        <>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Email Verified!
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <p className="text-sm text-gray-500">
            Redirecting to sign in page...
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Sign Up Again
            </Link>
            <Link
              href="/signin"
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Go to Sign In
            </Link>
          </div>
        </>
      )}
    </>
  );
}

export default function EmailVerification() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Suspense fallback={<VerifyingSpinner />}>
            <EmailVerificationContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AuthHeader } from "@/components/ui/AuthHeader";
import { AuthFooter } from "@/components/ui/AuthFooter";
import { FormField } from "@/components/ui/FormField";
import { useToaster } from "@/components/ui/Toaster";
import { requestPasswordReset } from "@/lib/api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToaster();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await requestPasswordReset(email.trim());

      // Keep response generic for account-enumeration safety.
      setSubmitted(true);
      showToast({
        type: response.success ? "success" : "error",
        title: response.success ? "Email Sent" : "Request Processed",
        description:
          response.message ||
          "If an account exists with this email, a password reset link has been sent.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Request Failed",
        description: "Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAF9] flex flex-col">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-sm p-8 mobile:p-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 text-center">
              Forgot your password?
            </h1>
            <p className="text-gray-600 mb-8 text-center">
              Enter your account email and we&apos;ll send a password reset
              link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                name="email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
                helperText="Use the same email you use to sign in."
              />

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full py-3 px-6 bg-primary text-white font-medium rounded-[10px] transition-all hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </form>

            {submitted && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                If an account exists with this email, a reset link has been
                sent. Please check your inbox and spam folder.
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/signin"
                className="text-primary hover:text-primary-hover hover:underline text-sm"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}

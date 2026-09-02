"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { HiOutlineEnvelope, HiOutlineArrowLeft } from "react-icons/hi2";
import { AuthHeader } from "@/components/ui/AuthHeader";
import { AuthFooter } from "@/components/ui/AuthFooter";
import { FormField } from "@/components/ui/FormField";
import { useToaster } from "@/components/ui/Toaster";
import { requestPasswordReset } from "@/lib/api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { showToast } = useToaster();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter the email you sign in with.");
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("That doesn't look like a valid email address.");
      return;
    }
    setError("");

    setIsSubmitting(true);
    try {
      const response = await requestPasswordReset(trimmed);
      // Deliberately generic either way — confirming which addresses exist
      // would turn this form into an account-enumeration oracle.
      setSentTo(trimmed);
      if (!response.success) {
        showToast({
          type: "error",
          title: "Request processed",
          description:
            response.message ||
            "If an account exists with this email, a reset link is on its way.",
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Request failed",
        description: "Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAF9] flex flex-col font-open-sans">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mobile:p-6">
            {sentTo ? (
              /* Post-submit: the form has done its job, so the card says what
                 happens next and offers one way onward - not a live form with
                 a success note bolted underneath it. */
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-50 text-primary flex items-center justify-center mb-5">
                  <HiOutlineEnvelope className="w-6 h-6" />
                </div>
                <h1 className="font-lato text-xl md:text-3xl font-semibold text-gray-900 tracking-tight leading-tight">
                  Check your inbox
                </h1>
                <p className="mt-2.5 text-gray-600 leading-relaxed">
                  If an account exists for{" "}
                  <span className="font-semibold text-gray-900 break-all">
                    {sentTo}
                  </span>
                  , we&apos;ve sent a link to reset your password. It expires in
                  one hour.
                </p>
                <p className="mt-3 text-sm text-gray-500">
                  Nothing yet? Check your spam folder before trying again.
                </p>

                <div className="mt-7 space-y-3">
                  <Link
                    href="/signin"
                    className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 no-underline"
                  >
                    Back to Sign In
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSentTo(null);
                      setEmail("");
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-white px-8 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Use a different email
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="font-lato text-xl md:text-3xl font-semibold text-gray-900 tracking-tight leading-tight">
                  Forgot your password?
                </h1>
                <p className="mt-2.5 text-gray-600 leading-relaxed">
                  Enter your account email and we&apos;ll send you a link to set
                  a new one.
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
                  <FormField
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(v) => {
                      setEmail(v);
                      if (error) setError("");
                    }}
                    error={error}
                    helperText="Use the same email you sign in with."
                    autoComplete="email"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-text-muted"
                  >
                    {isSubmitting ? "Sending…" : "Send reset link"}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100">
                  <Link
                    href="/signin"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary transition-colors no-underline"
                  >
                    <HiOutlineArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}

"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthHeader } from "@/components/ui/AuthHeader";
import { AuthFooter } from "@/components/ui/AuthFooter";
import { PasswordField } from "@/components/ui/PasswordField";
import { useToaster } from "@/components/ui/Toaster";
import { resetPasswordWithToken } from "@/lib/api";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password needs one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password needs one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password needs one number";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password needs one special character";
  }
  return null;
}

export function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { showToast } = useToaster();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || isSubmitting) return;

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setFieldError("Passwords do not match");
      return;
    }

    setFieldError(null);
    setIsSubmitting(true);

    try {
      const response = await resetPasswordWithToken(token, newPassword);

      if (!response.success) {
        throw new Error(response.message || "Unable to reset password");
      }

      setSuccess(true);
      showToast({
        type: "success",
        title: "Password Reset",
        description: "Your password has been reset. You can now sign in.",
      });

      setTimeout(() => router.push("/signin"), 1800);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to reset password";
      showToast({
        type: "error",
        title: "Reset Failed",
        description: message,
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
              Reset your password
            </h1>
            <p className="text-gray-600 mb-8 text-center">
              Enter a new secure password for your account.
            </p>

            {!token && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                This reset link is invalid. Please request a new one.
              </div>
            )}

            {success ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 text-center">
                Password reset successful. Redirecting to sign in...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordField
                  name="new-password"
                  label="New password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={setNewPassword}
                />

                <PasswordField
                  name="confirm-password"
                  label="Confirm new password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />

                {fieldError && (
                  <p className="text-sm text-primary">{fieldError}</p>
                )}

                <p className="text-xs text-gray-500 leading-relaxed">
                  Password must be at least 8 characters and include uppercase,
                  lowercase, number, and special character.
                </p>

                <button
                  type="submit"
                  disabled={
                    isSubmitting || !token || !newPassword || !confirmPassword
                  }
                  className="w-full py-3 px-6 bg-primary text-white font-medium rounded-[10px] transition-all hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Resetting..." : "Reset password"}
                </button>
              </form>
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

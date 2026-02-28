import { SignupFormData } from "@/types/signup";
import { HiCheckCircle } from "react-icons/hi";
import { CiMail } from "react-icons/ci";
import { useState, useEffect } from "react";
import { useToaster } from "@/components/ui/Toaster";

interface CompletionStepProps {
  formData: SignupFormData;
  onResendEmail?: () => Promise<void>;
}

export function CompletionStep({
  formData,
  onResendEmail,
}: CompletionStepProps) {
  const { showToast } = useToaster();
  const [isResending, setIsResending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  // Exponential backoff: 60s, 120s, 300s (5m), 600s (10m), 900s (15m)
  const getWaitTime = (attempts: number): number => {
    const waitTimes = [60, 120, 300, 600, 900]; // in seconds
    return waitTimes[Math.min(attempts, waitTimes.length - 1)];
  };

  // Start initial 1-minute timer on mount
  useEffect(() => {
    setTimeRemaining(60); // 1 minute initial cooldown
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleResendEmail = async () => {
    if (!onResendEmail || timeRemaining > 0) return;

    // Check if max attempts reached
    if (resendAttempts >= MAX_ATTEMPTS) {
      showToast({
        type: "error",
        title: "Maximum Attempts Reached",
        description:
          "You've reached the maximum resend limit. Please contact support if you need help.",
      });
      return;
    }

    setIsResending(true);
    try {
      await onResendEmail();

      const newAttempts = resendAttempts + 1;
      setResendAttempts(newAttempts);

      showToast({
        type: "success",
        title: "Email Sent!",
        description:
          "Verification email has been resent. Please check your inbox.",
      });

      // Apply exponential backoff - increase wait time with each attempt
      const nextWaitTime = getWaitTime(newAttempts);
      setTimeRemaining(nextWaitTime);
    } catch (error) {
      showToast({
        type: "error",
        title: "Failed to Resend",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a few moments.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Email Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CiMail className="w-12 h-12 text-green-600" />
        </div>
      </div>

      {/* Heading */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Account creation successful
        </h2>
        <p className="text-gray-600">
          We've sent a verification link to your email
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <HiCheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            Click the verification link in your email to activate your account
          </p>
        </div>
        <div className="flex items-start gap-3">
          <HiCheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            Check your spam folder if you don't see it in your inbox
          </p>
        </div>
        <div className="flex items-start gap-3">
          <HiCheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            The link will no longer be valid after 24hrs
          </p>
        </div>
      </div>

      {/* Resend Email Section */}
      <div className="text-center space-y-3">
        <p className="text-sm text-gray-600">Didn't receive the email?</p>

        {resendAttempts >= MAX_ATTEMPTS ? (
          <div className="text-sm text-red-600">
            Maximum resend attempts reached. Please contact{" "}
            <a href="/support" className="underline hover:text-red-700">
              support
            </a>{" "}
            for assistance.
          </div>
        ) : timeRemaining > 0 ? (
          <div className="text-sm text-gray-500">
            Resend available in{" "}
            <span className="font-semibold text-primary">
              {formatTime(timeRemaining)}
            </span>
            {resendAttempts > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                Attempts: {resendAttempts}/{MAX_ATTEMPTS}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={isResending}
              className="text-primary hover:text-primary/80 font-medium text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </button>
            {resendAttempts > 0 && (
              <div className="text-xs text-gray-400">
                Attempts: {resendAttempts}/{MAX_ATTEMPTS}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Need help? Contact our{" "}
          <a href="/support" className="text-primary hover:underline">
            support team
          </a>
        </p>
      </div>
    </div>
  );
}

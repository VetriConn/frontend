import { SignupFormData } from "@/types/signup";
import { HiCheckCircle } from "react-icons/hi";
import { CiMail } from "react-icons/ci";
import { useState, useEffect, useCallback, useRef } from "react";
import { useToaster } from "@/components/ui/Toaster";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiUrl } from "@/lib/api-config";
import { RETURN_URL_PARAM, withReturnUrl } from "@/lib/auth-redirect";

interface CompletionStepProps {
  formData: SignupFormData;
  onResendEmail?: () => Promise<void>;
}

export function CompletionStep({
  formData,
  onResendEmail,
}: CompletionStepProps) {
  const { showToast } = useToaster();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isResending, setIsResending] = useState(false);

  // Someone who signed up to accept a company invite still has to sign in
  // afterwards — keep the invite as their destination through that hop.
  const rawReturnUrl = searchParams.get(RETURN_URL_PARAM);
  const signInHref = rawReturnUrl
    ? withReturnUrl("/signin", rawReturnUrl)
    : "/signin";
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const MAX_ATTEMPTS = 5;
  const POLL_INTERVAL = 3000; // 3 seconds
  const MAX_POLL_COUNT = 40; // 40 checks × 3s = 2 minutes

  // Exponential backoff: 60s, 120s, 300s (5m), 600s (10m), 900s (15m)
  const getWaitTime = (attempts: number): number => {
    const waitTimes = [60, 120, 300, 600, 900]; // in seconds
    return waitTimes[Math.min(attempts, waitTimes.length - 1)];
  };

  /**
   * Check if user's email has been verified
   * Industry standard: Poll backend to check verification status
   */
  const checkVerificationStatus = useCallback(async () => {
    if (!formData.email) return false;

    try {
      setIsCheckingVerification(true);
      const response = await fetch(
        getApiUrl(`/api/v1/auth/check-verification?email=${encodeURIComponent(formData.email)}`),
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.data?.isVerified) {
        // User has verified! Auto-redirect to signin
        showToast({
          type: "success",
          title: "Email Verified!",
          description: "Redirecting you to sign in...",
        });
        
        // Clear polling interval
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        // Redirect after short delay
        setTimeout(() => {
          router.push(signInHref);
        }, 1500);

        return true;
      }

      return false;
    } catch (error) {
      // Silently fail - don't show errors for polling
      console.warn("Verification check failed:", error);
      return false;
    } finally {
      setIsCheckingVerification(false);
    }
  }, [formData.email, router, showToast]);

  /**
   * Start polling for verification status
   * Industry standard: Check every 3 seconds for up to 2 minutes
   */
  useEffect(() => {
    // Start polling after component mounts
    const startPolling = () => {
      pollIntervalRef.current = setInterval(async () => {
        setPollCount((prev) => {
          const newCount = prev + 1;
          
          // Stop polling after max attempts
          if (newCount >= MAX_POLL_COUNT) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            return prev;
          }

          return newCount;
        });

        await checkVerificationStatus();
      }, POLL_INTERVAL);
    };

    startPolling();

    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [checkVerificationStatus]);

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
          Verify your email to finish signing up
        </h2>
        <p className="text-gray-600">
          We&apos;ve sent a verification link to your email address
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <HiCheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            Click the verification link in your email to create and activate
            your account
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
            The link expires after 24 hours
          </p>
        </div>
        <div className="flex items-start gap-3">
          <HiCheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            You&apos;ll be automatically redirected once verified
          </p>
        </div>
      </div>

      {formData.resumeFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          Your resume will need to be uploaded after you verify your email and
          sign in.
        </div>
      )}

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

      {/* Manual continue button as fallback */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => router.push(signInHref)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Already verified? Continue to Sign In
        </button>
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

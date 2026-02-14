import { SignupFormData } from "@/types/signup";
import { HiCheckCircle } from "react-icons/hi";
import { CiMail } from "react-icons/ci";
import { useState, useEffect } from "react";
import { useToaster } from "@/components/ui/Toaster";

interface CompletionStepProps {
  formData: SignupFormData;
  onResendEmail?: () => Promise<void>;
}

export function CompletionStep({ formData, onResendEmail }: CompletionStepProps) {
  const { showToast } = useToaster();
  const [isResending, setIsResending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Start 2-minute timer on mount
  useEffect(() => {
    setTimeRemaining(120); // 2 minutes in seconds
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
    
    setIsResending(true);
    try {
      await onResendEmail();
      showToast({
        type: "success",
        title: "Email Sent!",
        description: "Verification email has been resent. Please check your inbox.",
      });
      // Restart the 2-minute timer
      setTimeRemaining(120);
    } catch (error) {
      showToast({
        type: "error",
        title: "Failed to Resend",
        description: "Please try again in a few moments.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <p className="text-sm text-gray-600">
          Didn't receive the email?
        </p>
        
        {timeRemaining > 0 ? (
          <div className="text-sm text-gray-500">
            Resend available in <span className="font-semibold text-primary">{formatTime(timeRemaining)}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isResending}
            className="text-primary hover:text-primary/80 font-medium text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
          </button>
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

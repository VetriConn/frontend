"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { StepProps } from "@/types/signup";
import { ProfileCompletion } from "../ProfileCompletion";

/**
 * Step 6: Completion Screen
 * Shows success message and profile completion status
 * Requirements: 7.1, 7.2, 7.3, 7.8, 7.9
 */
export const CompletionStep = ({ formData }: StepProps) => {
  const router = useRouter();

  // Calculate profile completion percentage
  const completionPercentage = useMemo(() => {
    const fields = [
      { value: formData.role, weight: 10 },
      { value: formData.fullName, weight: 15 },
      { value: formData.email, weight: 15 },
      { value: formData.password, weight: 10 },
      { value: formData.city, weight: 10 },
      { value: formData.country, weight: 10 },
      { value: formData.phoneNumber, weight: 5 },
      { value: formData.jobTitle, weight: 8 },
      { value: formData.skillArea, weight: 7 },
      { value: formData.yearsOfExperience, weight: 5 },
      { value: formData.resumeFile, weight: 5 },
    ];

    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
    const completedWeight = fields.reduce((sum, field) => {
      const hasValue = field.value !== null && field.value !== "" && field.value !== undefined;
      return sum + (hasValue ? field.weight : 0);
    }, 0);

    return Math.round((completedWeight / totalWeight) * 100);
  }, [formData]);

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      {/* Green Checkmark Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircleIcon className="w-12 h-12 text-green-500" />
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
        You&apos;re all set to get started!
      </h1>
      
      {/* Subtext */}
      <p className="text-gray-600 mb-8">
        Your account is ready. Start exploring flexible job opportunities that match your experience.
      </p>

      {/* Profile Completion */}
      <div className="mb-8">
        <ProfileCompletion percentage={completionPercentage} />
      </div>

      {/* Go to Dashboard Button */}
      <button
        type="button"
        onClick={handleGoToDashboard}
        className="w-full py-3 px-6 bg-primary text-white font-medium rounded-[10px] transition-all hover:bg-primary/90 flex items-center justify-center gap-2"
      >
        Go to my dashboard
        <ArrowRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

// Check circle icon
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Arrow right icon
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
  </svg>
);

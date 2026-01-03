"use client";

import { StepProps } from "@/types/signup";
import { RoleCard } from "../RoleCard";
import { HiOfficeBuilding } from "react-icons/hi";

/**
 * Step 1: Account Type Selection
 * Allows users to select their role (Job Seeker or Employer)
 * Requirements: 2.1, 2.2, 2.3, 2.7, 2.8, 2.9
 */
export const AccountTypeStep = ({
  formData,
  onFieldChange,
  onNext,
}: StepProps) => {
  const isRoleSelected = formData.role !== null;

  const handleRoleSelect = (role: "jobseeker" | "employer") => {
    onFieldChange("role", role);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 text-center">
        Welcome! Let&apos;s get started.
      </h1>
      
      {/* Subtext */}
      <p className="text-gray-600 mb-8 text-center">
        Tell us how you&apos;d like to use Vetriconn.
      </p>

      {/* Role Cards */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <RoleCard
          icon={<BriefcaseIcon className="w-6 h-6" />}
          title="Find a Job"
          description="I'm looking for flexible or part-time work opportunities."
          selected={formData.role === "jobseeker"}
          onSelect={() => handleRoleSelect("jobseeker")}
        />
        <RoleCard
          icon={<HiOfficeBuilding className="w-6 h-6" />}
          title="Post a Job"
          description="I want to hire experienced or retired professionals."
          selected={formData.role === "employer"}
          onSelect={() => handleRoleSelect("employer")}
        />
      </div>

      {/* Continue Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={!isRoleSelected}
        className="w-full py-3 px-6 bg-primary text-white font-medium rounded-[10px] transition-all hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
};

// Briefcase icon for "Find a Job"
const BriefcaseIcon = ({ className }: { className?: string }) => (
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
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

// Document icon for "Post a Job"
const DocumentIcon = ({ className }: { className?: string }) => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

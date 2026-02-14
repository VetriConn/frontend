"use client";
import React from "react";
import { UserProfile } from "@/types/api";
import { calculateProfileCompletion } from "@/lib/profile-utils";
import { FaCircle } from "react-icons/fa";
import { CheckCircleIcon } from "@/components/ui/CheckCircleIcon";

interface ProfileCompletionCardProps {
  userProfile: UserProfile;
  onSectionClick?: (section: string) => void;
}

// Map field names to user-friendly section names
const sectionDisplayNames: Record<string, string> = {
  full_name: "Full Name",
  phone_number: "Phone Number",
  location: "Location",
  job_title: "Job Title",
  bio: "Bio",
  work_experience: "Work Experience",
  education: "Education",
};

// Map field names to card element IDs for scrolling
const sectionElementIds: Record<string, string> = {
  full_name: "profile-header",
  phone_number: "contact-info-card",
  location: "contact-info-card",
  job_title: "profile-header",
  bio: "profile-header",
  work_experience: "work-experience-card",
  education: "education-card",
};

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  userProfile,
  onSectionClick,
}) => {
  const { percentage, completedSections, incompleteSections } =
    calculateProfileCompletion(userProfile);

  const handleSectionClick = (section: string) => {
    const elementId = sectionElementIds[section];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    // Call optional callback
    if (onSectionClick) {
      onSectionClick(section);
    }
  };

  const isComplete = percentage === 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 lg:mt-20">
      <div className="flex-1 ">
        <h3 className="text-lg  font-bold text-gray-900 mb-2">
          Profile Completion
        </h3>

        {/* Completion percentage and progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {isComplete ? "Complete!" : "In Progress"}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {percentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Profile ${percentage}% complete`}
            />
          </div>
        </div>

        {/* Section list */}
        <div className="space-y-2 mb-4">
          {Object.keys(sectionDisplayNames).map((field) => {
            const isCompleted = completedSections.includes(field);
            const displayName = sectionDisplayNames[field];

            return (
              <button
                key={field}
                onClick={() => !isCompleted && handleSectionClick(field)}
                className={`flex items-center gap-2 text-sm w-full text-left ${
                  isCompleted
                    ? "text-gray-500 cursor-default"
                    : "text-gray-700 hover:text-red-600 cursor-pointer"
                }`}
                disabled={isCompleted}
                aria-label={`${displayName} - ${isCompleted ? "completed" : "incomplete, click to navigate"}`}
              >
                {isCompleted ? (
                  <CheckCircleIcon
                    color="green"
                    size={18}
                    className="shrink-0"
                  />
                ) : (
                  <FaCircle className="text-gray-300 shrink-0 text-xs" />
                )}
                <span className={isCompleted ? "line-through" : ""}>
                  {displayName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action button or success message */}
        {isComplete ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircleIcon color="green" size={18} className="shrink-0" />
            <span className="text-sm font-medium text-green-800">
              Your profile is complete!
            </span>
          </div>
        ) : (
          <button
            onClick={() => {
              // Scroll to first incomplete section
              if (incompleteSections.length > 0) {
                handleSectionClick(incompleteSections[0]);
              }
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            aria-label="Complete your profile"
          >
            Complete profile
          </button>
        )}
      </div>
    </div>
  );
};

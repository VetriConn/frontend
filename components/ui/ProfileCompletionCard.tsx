"use client";
import React from "react";
import { FaCircle } from "react-icons/fa";
import { CheckCircleIcon } from "@/components/ui/CheckCircleIcon";
import type { CompletionStatus } from "@/lib/profile-utils";

interface ProfileCompletionCardProps {
  completion: CompletionStatus;
  onSectionClick?: (section: string) => void;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  completion,
  onSectionClick,
}) => {
  const { percentage, items, incompleteSections } = completion;

  const handleSectionClick = (field: string, scrollTo: string) => {
    const element = document.getElementById(scrollTo);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (onSectionClick) {
      onSectionClick(field);
    }
  };

  const isComplete = percentage === 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 lg:mt-20">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
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
              className={`h-full transition-all duration-300 ${
                isComplete
                  ? "bg-emerald-500"
                  : percentage >= 60
                    ? "bg-amber-500"
                    : "bg-red-600"
              }`}
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
          {items.map((item) => (
            <button
              key={item.field}
              onClick={() =>
                !item.isComplete &&
                handleSectionClick(item.field, item.scrollTo)
              }
              className={`flex items-center gap-2 text-sm w-full text-left ${
                item.isComplete
                  ? "text-gray-500 cursor-default"
                  : "text-gray-700 hover:text-red-600 cursor-pointer"
              }`}
              disabled={item.isComplete}
              aria-label={`${item.label} - ${item.isComplete ? "completed" : "incomplete, click to navigate"}`}
            >
              {item.isComplete ? (
                <CheckCircleIcon color="green" size={18} className="shrink-0" />
              ) : (
                <FaCircle className="text-gray-300 shrink-0 text-xs" />
              )}
              <span className={item.isComplete ? "line-through" : ""}>
                {item.label}
              </span>
            </button>
          ))}
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
              if (incompleteSections.length > 0) {
                const first = items.find((i) => !i.isComplete);
                if (first) handleSectionClick(first.field, first.scrollTo);
              }
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm cursor-pointer"
            aria-label="Complete your profile"
          >
            Complete profile
          </button>
        )}
      </div>
    </div>
  );
};

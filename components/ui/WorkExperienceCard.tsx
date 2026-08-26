"use client";
import React from "react";
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBriefcase,
} from "react-icons/hi2";
import { WorkExperience } from "@/types/api";

interface WorkExperienceCardProps {
  experiences: WorkExperience[];
  onAdd: () => void;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
}

export const WorkExperienceCard: React.FC<WorkExperienceCardProps> = ({
  experiences,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const formatDate = (date?: string) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    } catch {
      return date;
    }
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    if (!startDate && !endDate) return "";
    if (!startDate) return end;
    if (!endDate) return `${start} – Present`;

    return `${start} – ${end}`;
  };

  // Sort by most recent first (end_date descending, no end_date = current/most recent)
  // Preserve original indices so edit/delete callbacks reference the correct item
  const sortedExperiences = experiences
    .map((exp, originalIndex) => ({ ...exp, _originalIndex: originalIndex }))
    .sort((a, b) => {
      const endA = a.end_date ? new Date(a.end_date).getTime() : Infinity;
      const endB = b.end_date ? new Date(b.end_date).getTime() : Infinity;
      if (endA !== endB) return endB - endA;
      const startA = a.start_date ? new Date(a.start_date).getTime() : 0;
      const startB = b.start_date ? new Date(b.start_date).getTime() : 0;
      return startB - startA;
    });

  const hasExperiences = sortedExperiences.length > 0;

  return (
    <div
      id="work-experience-card"
      className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex items-center gap-2">
          <HiOutlineBriefcase className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Work Experience
          </h2>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 min-h-[44px] bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm md:text-base"
          aria-label="Add work experience"
        >
          <HiOutlinePlus className="w-4 h-4 md:w-5 md:h-5" />
          Add experience
        </button>
      </div>

      {hasExperiences ? (
        <div className="space-y-0">
          {sortedExperiences.map((exp, index) => {
            const isLast = index === sortedExperiences.length - 1;
            return (
              <div key={index} className="flex gap-4 md:gap-6">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center pt-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0${!isLast ? " pb-10" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-gray-900">
                        {exp.position}
                      </h3>
                      <p className="text-sm md:text-base font-medium text-gray-700 mt-0.5">
                        {exp.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onEdit?.(exp._originalIndex)}
                        className="p-1.5 min-h-[44px] min-w-[44px] text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100 flex items-center justify-center"
                        aria-label={`Edit ${exp.position}`}
                      >
                        <HiOutlinePencilSquare className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                      <button
                        onClick={() => onDelete?.(exp._originalIndex)}
                        className="p-1.5 min-h-[44px] min-w-[44px] text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-gray-100 flex items-center justify-center"
                        aria-label={`Delete ${exp.position}`}
                      >
                        <HiOutlineTrash className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </div>
                  </div>

                  {(exp.start_date || exp.end_date) && (
                    <p className="text-sm text-gray-400 mt-0.5">
                      {formatDateRange(exp.start_date, exp.end_date)}
                    </p>
                  )}

                  {exp.description && (
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-2 whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <HiOutlineBriefcase className="w-8 h-8 md:w-12 md:h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm md:text-base text-gray-500 mb-1">
            No work experience added yet
          </p>
          <p className="text-gray-400 text-xs">
            Click &quot;+ Add experience&quot; to add your work history
          </p>
        </div>
      )}
    </div>
  );
};

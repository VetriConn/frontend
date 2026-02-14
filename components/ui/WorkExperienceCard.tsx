"use client";
import React from "react";
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
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
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
          aria-label="Add work experience"
        >
          <HiOutlinePlus className="text-base" />
          Add experience
        </button>
      </div>

      {hasExperiences ? (
        <div className="space-y-0">
          {sortedExperiences.map((exp, index) => {
            const isLast = index === sortedExperiences.length - 1;
            return (
              <div key={index} className="flex gap-4">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center pt-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                </div>

                {/* Content */}
                <div className={`flex-10${!isLast ? " pb-10" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        {exp.position}
                      </h3>
                      <p className="text-sm font-medium text-gray-700 mt-0.5">
                        {exp.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                      <button
                        onClick={() => onEdit?.(exp._originalIndex)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                        aria-label={`Edit ${exp.position}`}
                      >
                        <HiOutlinePencilSquare className="text-base" />
                      </button>
                      <button
                        onClick={() => onDelete?.(exp._originalIndex)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-gray-100"
                        aria-label={`Delete ${exp.position}`}
                      >
                        <HiOutlineTrash className="text-base" />
                      </button>
                    </div>
                  </div>

                  {(exp.start_date || exp.end_date) && (
                    <p className="text-sm text-gray-400 mt-0.5">
                      {formatDateRange(exp.start_date, exp.end_date)}
                    </p>
                  )}

                  {exp.description && (
                    <p className="text-sm text-gray-600 leading-relaxed mt-2 whitespace-pre-line">
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
          <p className="text-gray-500 text-sm mb-1">
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

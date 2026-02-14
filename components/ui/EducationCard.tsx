"use client";
import React from "react";
import {
  HiOutlinePlus,
  HiOutlineAcademicCap,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { Education } from "@/types/api";

interface EducationCardProps {
  education: Education[];
  onAdd: () => void;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
}

export const EducationCard: React.FC<EducationCardProps> = ({
  education,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const formatYearRange = (startYear?: string, endYear?: string) => {
    if (!startYear && !endYear) return "";
    if (!startYear) return endYear;
    if (!endYear) return `${startYear} – Present`;

    return `${startYear} – ${endYear}`;
  };

  // Sort by most recent first (end_year descending, no end_year = current/most recent)
  // Preserve original indices so edit/delete callbacks reference the correct item
  const sortedEducation = education
    .map((edu, originalIndex) => ({ ...edu, _originalIndex: originalIndex }))
    .sort((a, b) => {
      const endA = a.end_year ? parseInt(a.end_year, 10) : Infinity;
      const endB = b.end_year ? parseInt(b.end_year, 10) : Infinity;
      if (endA !== endB) return endB - endA;
      const startA = a.start_year ? parseInt(a.start_year, 10) : 0;
      const startB = b.start_year ? parseInt(b.start_year, 10) : 0;
      return startB - startA;
    });

  const hasEducation = sortedEducation.length > 0;

  return (
    <div
      id="education-card"
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Education</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
          aria-label="Add education"
        >
          <HiOutlinePlus className="text-base" />
          Add education
        </button>
      </div>

      {hasEducation ? (
        <div className="space-y-6">
          {sortedEducation.map((edu, index) => (
            <div
              key={index}
              className="flex gap-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <HiOutlineAcademicCap className="text-red-500 text-lg" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {edu.institution}
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {edu.degree}
                      {edu.field_of_study ? ` of ${edu.field_of_study}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <button
                      onClick={() => onEdit?.(edu._originalIndex)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      aria-label={`Edit ${edu.institution}`}
                    >
                      <HiOutlinePencilSquare className="text-base" />
                    </button>
                    <button
                      onClick={() => onDelete?.(edu._originalIndex)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-gray-100"
                      aria-label={`Delete ${edu.institution}`}
                    >
                      <HiOutlineTrash className="text-base" />
                    </button>
                  </div>
                </div>

                {(edu.start_year || edu.end_year) && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    {formatYearRange(edu.start_year, edu.end_year)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm mb-1">No education added yet</p>
          <p className="text-gray-400 text-xs">
            Click &quot;+ Add education&quot; to add your education history
          </p>
        </div>
      )}
    </div>
  );
};

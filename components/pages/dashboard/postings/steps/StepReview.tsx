"use client";

import React from "react";
import { HiCheck } from "react-icons/hi2";
import {
  regionName,
} from "@/lib/regions";
import {
  JOB_CATEGORIES,
  JOB_TYPES,
  WORK_ARRANGEMENTS,
  EXPERIENCE_LEVELS,
  WORK_SCHEDULES,
  PHYSICAL_DEMANDS,
  type JobFormData,
} from "../jobForm";

export function StepReview({ formData }: { formData: JobFormData }) {
  // The brief is HTML; show plain text in the compact preview.
  const plainDescription = formData.description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const formatSalary = () => {
    if (!formData.salary_min && !formData.salary_max) return "Not specified";
    if (formData.salary_min && formData.salary_max) {
      return `$${Number(formData.salary_min).toLocaleString()} – $${Number(formData.salary_max).toLocaleString()}`;
    }
    if (formData.salary_min)
      return `From $${Number(formData.salary_min).toLocaleString()}`;
    return `Up to $${Number(formData.salary_max).toLocaleString()}`;
  };

  const displayLocation = [
    formData.city,
    regionName(formData.country, formData.state_province),
    formData.country,
  ]
    .filter(Boolean)
    .join(", ");

  const displayJobType = JOB_TYPES.find(
    (t) => t.value === formData.job_type,
  )?.label;
  const displayArrangement = WORK_ARRANGEMENTS.find(
    (t) => t.value === formData.work_arrangement,
  )?.label;
  const displayCategory = JOB_CATEGORIES.find(
    (c) => c.value === formData.job_category,
  )?.label;
  const displaySchedule = WORK_SCHEDULES.find(
    (ws) => ws.value === formData.work_schedule,
  )?.label;
  const displayExperience = EXPERIENCE_LEVELS.find(
    (l) => l.value === formData.experience_level,
  )?.label;

  // Summary checklist
  const summaryItems = [
    {
      label: "Title",
      value: formData.job_title,
    },
    {
      label: "Category",
      value: displayCategory,
    },
    {
      label: "Type",
      value: displayJobType,
    },
    {
      label: "Salary",
      value: formData.salary_min || formData.salary_max ? formatSalary() : "",
    },
    {
      label: "Location",
      value: displayLocation,
    },
    {
      label: "Experience",
      value: displayExperience,
    },
  ];

  const missingRequired =
    !formData.job_title ||
    !formData.job_category ||
    !formData.city ||
    (!formData.salary_min && !formData.salary_max) ||
    !plainDescription ||
    !formData.responsibilities.trim();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Review Your Posting
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-6">
        Review all the details before submitting. This is how candidates will
        see your posting.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        {/* Left — Preview card */}
        <div className="lg:col-span-3 border border-gray-200 rounded-xl p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg md:text-2xl font-bold text-gray-900">
              {formData.job_title || "Job Title"}
            </h3>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              Preview
            </span>
          </div>
          <p className="text-sm md:text-base text-gray-600 mb-3">
            {displayCategory || "Category"}
          </p>

          {/* Tags row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-5">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {displayJobType || "Not specified"}
              {displayArrangement ? ` · ${displayArrangement}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {formData.salary_min || formData.salary_max
                ? formatSalary()
                : "Not specified"}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {displaySchedule || "Schedule"}
            </span>
          </div>

          {/* About this role */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              About this role
            </h4>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              {plainDescription
                ? plainDescription.slice(0, 300) +
                  (plainDescription.length > 300 ? "..." : "")
                : "No description provided."}
            </p>
          </div>

          {/* Requirements */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Requirements
            </h4>
            <div className="space-y-1">
              <p className="text-sm md:text-base text-gray-600">
                <span className="font-medium text-gray-600">
                  Experience Level:
                </span>{" "}
                {displayExperience || "Not specified"}
              </p>
              {formData.skills && (
                <p className="text-sm md:text-base text-gray-600">
                  <span className="font-medium text-gray-600">
                    Required Skills:
                  </span>{" "}
                  {formData.skills}
                </p>
              )}
              {formData.physical_demands && (
                <p className="text-sm md:text-base text-gray-600">
                  <span className="font-medium text-gray-600">
                    Physical Demands:
                  </span>{" "}
                  {PHYSICAL_DEMANDS.find((d) => d.value === formData.physical_demands)?.label || formData.physical_demands}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right — Summary checklist */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">
              Summary
            </h3>
            <div className="space-y-3">
              {summaryItems.map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      item.value
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    {item.value && (
                      <HiCheck className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-medium text-gray-700">
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.value || "Not specified"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Required fields warning */}
            {missingRequired && (
              <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 leading-relaxed">
                  Please complete the required fields (Title, Category,
                  Location, Salary, Job Brief and What You&apos;ll Do) before
                  submitting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The wizard's progress rail: a vertical, numbered stepper in Vetriconn red.
 * Completed steps show a check and can be clicked to jump back; the current
 * step is marked with aria-current. It sits in a left rail on large screens
 * and stacks above the form on small ones, so it stays single-column-friendly
 * and legible at scaled text / high contrast.
 */

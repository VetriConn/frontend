"use client";

import React, { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { WorkExperience } from "@/types/api";

export interface AddExperienceFormProps {
  initialData?: WorkExperience;
  onDataChange: (data: WorkExperience) => void;
}

const EMPTY_EXPERIENCE: WorkExperience = {
  position: "",
  company: "",
  start_date: "",
  end_date: "",
  description: "",
};

export const AddExperienceForm: React.FC<AddExperienceFormProps> = ({
  initialData,
  onDataChange,
}) => {
  const [formData, setFormData] = useState<WorkExperience>(
    initialData || EMPTY_EXPERIENCE,
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isCurrentRole, setIsCurrentRole] = useState(!initialData?.end_date);

  const validate = (field: string, value: string): string | undefined => {
    if (field === "position" && !value.trim()) return "Job title is required";
    if (field === "company" && !value.trim()) return "Company name is required";
    if (field === "start_date" && !value.trim())
      return "Start date is required";
    return undefined;
  };

  const handleChange = (field: keyof WorkExperience, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    const error = validate(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));

    onDataChange(updated);
  };

  const handleCurrentRoleToggle = () => {
    const next = !isCurrentRole;
    setIsCurrentRole(next);
    if (next) {
      const updated = { ...formData, end_date: "" };
      setFormData(updated);
      onDataChange(updated);
    }
  };

  return (
    <div className="space-y-1">
      <FormField
        label="Job Title"
        name="position"
        placeholder="e.g. Operations Manager"
        value={formData.position}
        onChange={(v) => handleChange("position", v)}
        error={errors.position}
        required
      />

      <FormField
        label="Company"
        name="company"
        placeholder="e.g. Canadian Armed Forces"
        value={formData.company}
        onChange={(v) => handleChange("company", v)}
        error={errors.company}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 mb-4">
          <label
            htmlFor="start_date"
            className="block text-sm text-text-muted mb-1 font-medium"
          >
            Start Date <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="start_date"
            type="month"
            value={formData.start_date ? formData.start_date.slice(0, 7) : ""}
            onChange={(e) =>
              handleChange(
                "start_date",
                e.target.value ? `${e.target.value}-01` : "",
              )
            }
            className={`block w-full py-3 px-4 border rounded-[10px] text-base outline-none transition-colors focus:border-primary bg-white ${
              errors.start_date ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.start_date && (
            <span className="text-red-500 text-xs mt-1">
              {errors.start_date}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 mb-4">
          <label
            htmlFor="end_date"
            className="block text-sm text-text-muted mb-1 font-medium"
          >
            End Date
          </label>
          <input
            id="end_date"
            type="month"
            value={formData.end_date ? formData.end_date.slice(0, 7) : ""}
            onChange={(e) =>
              handleChange(
                "end_date",
                e.target.value ? `${e.target.value}-01` : "",
              )
            }
            disabled={isCurrentRole}
            className={`block w-full py-3 px-4 border rounded-[10px] text-base outline-none transition-colors focus:border-primary bg-white ${
              isCurrentRole
                ? "bg-gray-100 cursor-not-allowed border-gray-300"
                : "border-gray-300"
            }`}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 -mt-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={isCurrentRole}
          onChange={handleCurrentRoleToggle}
          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
        />
        I currently work here
      </label>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="block text-sm text-text-muted mb-1 font-medium"
        >
          Description{" "}
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Describe your responsibilities, accomplishments, etc."
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          className="block w-full py-3 px-4 border border-gray-300 rounded-[10px] text-base outline-none transition-colors focus:border-primary bg-white resize-none"
        />
      </div>
    </div>
  );
};

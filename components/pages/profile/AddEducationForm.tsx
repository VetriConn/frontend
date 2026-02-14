"use client";

import React, { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Education } from "@/types/api";

export interface AddEducationFormProps {
  initialData?: Education;
  onDataChange: (data: Education) => void;
}

const EMPTY_EDUCATION: Education = {
  institution: "",
  degree: "",
  field_of_study: "",
  start_year: "",
  end_year: "",
};

export const AddEducationForm: React.FC<AddEducationFormProps> = ({
  initialData,
  onDataChange,
}) => {
  const [formData, setFormData] = useState<Education>(
    initialData || EMPTY_EDUCATION,
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = (field: string, value: string): string | undefined => {
    if (field === "institution" && !value.trim())
      return "Institution is required";
    if (field === "degree" && !value.trim()) return "Degree is required";
    return undefined;
  };

  const handleChange = (field: keyof Education, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    const error = validate(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));

    onDataChange(updated);
  };

  // Generate year options from 1960 to current year
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => {
    const year = (currentYear - i).toString();
    return { value: year, label: year };
  });

  return (
    <div className="space-y-1">
      <FormField
        label="Institution"
        name="institution"
        placeholder="e.g. Royal Military College of Canada"
        value={formData.institution}
        onChange={(v) => handleChange("institution", v)}
        error={errors.institution}
        required
      />

      <FormField
        label="Degree"
        name="degree"
        placeholder="e.g. Bachelor of Science"
        value={formData.degree}
        onChange={(v) => handleChange("degree", v)}
        error={errors.degree}
        required
      />

      <FormField
        label="Field of Study"
        name="field_of_study"
        placeholder="e.g. Military Arts and Science"
        value={formData.field_of_study}
        onChange={(v) => handleChange("field_of_study", v)}
        optional
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Start Year"
          name="start_year"
          type="select"
          placeholder="Select year"
          value={formData.start_year || ""}
          onChange={(v) => handleChange("start_year", v)}
          options={yearOptions}
          optional
        />

        <FormField
          label="End Year"
          name="end_year"
          type="select"
          placeholder="Select year"
          value={formData.end_year || ""}
          onChange={(v) => handleChange("end_year", v)}
          options={yearOptions}
          optional
        />
      </div>
    </div>
  );
};

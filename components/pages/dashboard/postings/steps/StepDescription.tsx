"use client";

import React from "react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { FieldLabel, FieldError, HelperText } from "../formKit";
import type { JobFormData, FormErrors } from "../jobForm";

export function StepDescription({
  formData,
  errors,
  onChange,
}: {
  formData: JobFormData;
  errors: FormErrors;
  onChange: (field: keyof JobFormData, value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Job Description
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-6">
        Explain the role simply and honestly to help candidates understand what
        to expect. Use formatting to keep it scannable.
      </p>

      <FieldLabel htmlFor="description" required>
        Job Brief
      </FieldLabel>
      <RichTextEditor
        id="description"
        value={formData.description}
        onChange={(html) => onChange("description", html)}
        placeholder="What is this role, and what will they do day to day?"
        hasError={Boolean(errors.description)}
        ariaLabel="Job brief"
      />
      <FieldError message={errors.description} />

      {/* What You'll Do — the section whose data used to get buried. */}
      <div className="mt-6">
        <FieldLabel htmlFor="responsibilities" required>
          What You&apos;ll Do
        </FieldLabel>
        <HelperText>List the main responsibilities - one per line.</HelperText>
        <textarea
          id="responsibilities"
          value={formData.responsibilities}
          onChange={(e) => onChange("responsibilities", e.target.value)}
          rows={5}
          placeholder={
            "Greet and assist customers\nOperate the point-of-sale system\nKeep the work area clean and stocked"
          }
          className={`mt-1.5 w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none ${
            errors.responsibilities ? "border-red-500" : "border-gray-200"
          }`}
        />
        <FieldError message={errors.responsibilities} />
      </div>

      {/* What We're Looking For — optional requirement bullets. */}
      <div className="mt-6">
        <FieldLabel htmlFor="requirements">What We&apos;re Looking For</FieldLabel>
        <HelperText>
          List key requirements or qualifications - one per line. Optional.
        </HelperText>
        <textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => onChange("requirements", e.target.value)}
          rows={4}
          placeholder={
            "Comfortable on your feet for a full shift\nFriendly, reliable, and punctual\nRetail experience is a plus"
          }
          className="mt-1.5 w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
        />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  FieldLabel,
  FieldError,
  HelperText,
  SelectField,
  LocationFields,
  inputClasses,
  errorInputClasses,
} from "../formKit";
import {
  JOB_CATEGORIES,
  JOB_TYPES,
  WORK_ARRANGEMENTS,
  CURRENCIES,
  type JobFormData,
  type FormErrors,
} from "../jobForm";

export function StepEssentials({
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
        The essentials
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-6">
        Just the basics to get your job live. You can always edit it later.
      </p>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <FieldLabel htmlFor="job_title" required>
            Job Title
          </FieldLabel>
          <input
            id="job_title"
            type="text"
            value={formData.job_title}
            onChange={(e) => onChange("job_title", e.target.value)}
            placeholder="e.g., Customer Service Representative"
            className={errors.job_title ? errorInputClasses : inputClasses}
          />
          <FieldError message={errors.job_title} />
        </div>

        {/* Category & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <SelectField
            id="job_category"
            label="Category"
            value={formData.job_category}
            onChange={(v) => onChange("job_category", v)}
            options={JOB_CATEGORIES}
            placeholder="Select a category"
            required
            error={errors.job_category}
          />
          <SelectField
            id="job_type"
            label="Job Type"
            value={formData.job_type}
            onChange={(v) => onChange("job_type", v)}
            options={JOB_TYPES}
            placeholder="Select type"
          />
        </div>

        {/* Work Arrangement */}
        <SelectField
          id="work_arrangement"
          label="Work Arrangement"
          value={formData.work_arrangement}
          onChange={(v) => onChange("work_arrangement", v)}
          options={WORK_ARRANGEMENTS}
          placeholder="Select work arrangement"
        />

        {/* Country → Province/State → City */}
        <LocationFields
          country={formData.country}
          stateProvince={formData.state_province}
          city={formData.city}
          onChange={onChange}
          cityRequired
          cityError={errors.city}
        />

        {/* Salary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <FieldLabel htmlFor="salary_min" required>
              Salary (min)
            </FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                $
              </span>
              <input
                id="salary_min"
                type="number"
                min="0"
                value={formData.salary_min}
                onChange={(e) => onChange("salary_min", e.target.value)}
                className={`${errors.salary_min ? "border-red-500" : "border-gray-200"} w-full pl-7 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white`}
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="salary_max">Salary (max)</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                $
              </span>
              <input
                id="salary_max"
                type="number"
                min="0"
                value={formData.salary_max}
                onChange={(e) => onChange("salary_max", e.target.value)}
                className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
              />
            </div>
          </div>
          <SelectField
            id="currency"
            label="Currency"
            value={formData.currency}
            onChange={(v) => onChange("currency", v)}
            options={CURRENCIES}
            placeholder="Currency"
          />
        </div>
        <FieldError message={errors.salary_min} />

        {/* Brief */}
        <div>
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
        </div>

        {/* Responsibilities */}
        <div>
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
      </div>
    </div>
  );
}

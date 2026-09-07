"use client";

import React from "react";
import {
  FieldLabel,
  FieldError,
  HelperText,
  SelectField,
  ChipGroup,
  LocationFields,
  inputClasses,
} from "../formKit";
import {
  PAYMENT_TYPES,
  CURRENCIES,
  WORK_SCHEDULES,
  BENEFITS,
  type JobFormData,
  type FormErrors,
} from "../jobForm";

export function StepSalaryLocation({
  formData,
  errors,
  onChange,
  onToggle,
}: {
  formData: JobFormData;
  errors: FormErrors;
  onChange: (field: keyof JobFormData, value: string) => void;
  onToggle: (field: "languages" | "benefits", value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Salary &amp; Location
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-6">
        Be transparent about compensation and location to reduce uncertainty for
        applicants.
      </p>

      <div className="space-y-4 md:space-y-6">
        {/* Minimum / Maximum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <FieldLabel htmlFor="salary_min">Minimum</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                $
              </span>
              <input
                id="salary_min"
                type="number"
                value={formData.salary_min}
                onChange={(e) => onChange("salary_min", e.target.value)}
                min="0"
                className={`${errors.salary_min ? "border-red-500" : "border-gray-200"} w-full pl-7 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white`}
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="salary_max">Maximum</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                $
              </span>
              <input
                id="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={(e) => onChange("salary_max", e.target.value)}
                min="0"
                className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
              />
            </div>
          </div>
        </div>
        {errors.salary_min && <FieldError message={errors.salary_min} />}

        {/* Payment Type & Currency — side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <SelectField
            id="payment_type"
            label="Payment Type"
            value={formData.payment_type}
            onChange={(v) => onChange("payment_type", v)}
            options={PAYMENT_TYPES}
            placeholder="Select payment type"
          />
          <SelectField
            id="currency"
            label="Currency"
            value={formData.currency}
            onChange={(v) => onChange("currency", v)}
            options={CURRENCIES}
            placeholder="Currency"
          />
        </div>

        {/* Country → Province/State → City */}
        <LocationFields
          country={formData.country}
          stateProvince={formData.state_province}
          city={formData.city}
          onChange={onChange}
          cityRequired
          cityError={errors.city}
        />

        {/* Work Schedule */}
        <SelectField
          id="work_schedule"
          label="Work Schedule"
          value={formData.work_schedule}
          onChange={(v) => onChange("work_schedule", v)}
          options={WORK_SCHEDULES}
          placeholder="Select schedule type"
        />

        {/* Benefits */}
        <div>
          <FieldLabel>Benefits &amp; Perks</FieldLabel>
          <HelperText>Select everything this role offers.</HelperText>
          <div className="mt-2">
            <ChipGroup
              options={BENEFITS}
              selected={formData.benefits}
              onToggle={(v) => onToggle("benefits", v)}
              ariaLabel="Benefits and perks"
            />
          </div>
        </div>

        {/* Openings / Deadline / Start date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <FieldLabel htmlFor="openings">Openings</FieldLabel>
            <input
              id="openings"
              type="number"
              min="1"
              value={formData.openings}
              onChange={(e) => onChange("openings", e.target.value)}
              placeholder="1"
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel htmlFor="application_deadline">
              Application Deadline
            </FieldLabel>
            <input
              id="application_deadline"
              type="date"
              value={formData.application_deadline}
              onChange={(e) =>
                onChange("application_deadline", e.target.value)
              }
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel htmlFor="start_date">Expected Start</FieldLabel>
            <input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => onChange("start_date", e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

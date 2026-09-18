"use client";

import {
  FieldLabel,
  FieldError,
  HelperText,
  SelectField,
  ChipGroup,
  LocationFields,
  inputClasses,
} from "@/components/ui/formKit";
import { StepHeading, SalaryAmountField, type StepProps } from "./stepKit";
import {
  PAYMENT_TYPES,
  CURRENCIES,
  WORK_SCHEDULES,
  BENEFITS,
  type JobFormData,
} from "../jobForm";

/**
 * A date field with a way back out of it.
 *
 * `<input type="date">` is inconsistent about letting go of a value: Chrome
 * offers a clear button, Safari offers nothing at all, and neither is
 * discoverable. Since these two dates are the ones an employer most often
 * needs to withdraw — a deadline that has moved, a start date that is now
 * "whenever we find the right person" — the control is spelled out rather
 * than left to the browser.
 */
function ClearableDate({
  id,
  label,
  value,
  onChange,
}: {
  id: "application_deadline" | "start_date";
  label: string;
  value: string;
  onChange: (field: keyof JobFormData, value: string) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {value && (
          <button
            type="button"
            onClick={() => onChange(id, "")}
            className="text-sm text-gray-600 underline underline-offset-2 hover:text-primary mb-1.5 md:mb-2"
          >
            Clear<span className="sr-only"> {label.toLowerCase()}</span>
          </button>
        )}
      </div>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        className={inputClasses}
      />
    </div>
  );
}

export function StepSalaryLocation({
  formData,
  errors,
  onChange,
  onToggle,
}: StepProps & {
  onToggle: (field: "languages" | "benefits", value: string) => void;
}) {
  return (
    <div>
      <StepHeading title="Salary & Location">
        Be transparent about compensation and location to reduce uncertainty for
        applicants.
      </StepHeading>

      <div className="space-y-4 md:space-y-6">
        {/* Minimum / Maximum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <SalaryAmountField
            id="salary_min"
            label="Minimum"
            value={formData.salary_min}
            onChange={onChange}
            hasError={Boolean(errors.salary_min)}
          />
          <SalaryAmountField
            id="salary_max"
            label="Maximum"
            value={formData.salary_max}
            onChange={onChange}
          />
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
          <ClearableDate
            id="application_deadline"
            label="Application Deadline"
            value={formData.application_deadline}
            onChange={onChange}
          />
          <ClearableDate
            id="start_date"
            label="Expected Start"
            value={formData.start_date}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}

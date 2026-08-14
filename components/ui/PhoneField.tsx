"use client";

import clsx from "clsx";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

/**
 * Country-aware phone input, in two pieces:
 *
 *   PhoneInputControl — the bare control, for forms that render their own
 *                       label (CompanyProfileSetup, JobApplicationForm).
 *   PhoneField        — the control wrapped in the same label / helper /
 *                       error shell as `components/ui/FormField`.
 *
 * Value contract: the callback emits E.164 (`+15551234567`) or `""` when the
 * field is empty — never `undefined`, since every caller stores a `string`.
 * E.164 is what the backend already accepts (`z.string().max(30)`).
 *
 * Flags are bundled rather than fetched from the library's default CDN, so
 * these forms make no third-party image requests.
 */

/** Platform is Canada-first; the picker still offers every country. */
export const DEFAULT_PHONE_COUNTRY = "CA" as const;

/** Box styling used when a caller doesn't supply its own. Mirrors FormField. */
const DEFAULT_BOX_CLASSES =
  "w-full rounded-10 border border-gray-300 bg-white px-3 py-2 md:px-4 md:py-3";

export interface PhoneInputControlProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Draws the error border without owning the message. */
  invalid?: boolean;
  describedBy?: string;
  /** Replaces the default box styling so the control matches its host form. */
  className?: string;
  /** Accessible name for the country dropdown. */
  countryLabel?: string;
}

export const PhoneInputControl = ({
  id,
  name,
  value,
  onChange,
  disabled = false,
  placeholder,
  invalid = false,
  describedBy,
  className,
  countryLabel = "Country",
}: PhoneInputControlProps) => {
  // Border and focus ring live on the wrapper so the country select and the
  // number input read as a single control.
  const wrapperClasses = clsx(
    "flex items-center gap-2 transition-colors",
    "focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent",
    className ?? DEFAULT_BOX_CLASSES,
    invalid && "border-red-500",
    disabled && "bg-gray-100 cursor-not-allowed",
  );

  return (
    <PhoneInput
      id={id}
      name={name}
      flags={flags}
      international
      countryCallingCodeEditable={false}
      defaultCountry={DEFAULT_PHONE_COUNTRY}
      value={value || undefined}
      onChange={(next) => onChange(next ?? "")}
      disabled={disabled}
      placeholder={placeholder}
      className={wrapperClasses}
      numberInputProps={{
        className:
          "w-full border-none bg-transparent p-0 text-sm md:text-base outline-none disabled:cursor-not-allowed",
        "aria-describedby": describedBy,
        "aria-invalid": invalid,
      }}
      countrySelectProps={{ "aria-label": countryLabel }}
    />
  );
};

export interface PhoneFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const PhoneField = ({
  label,
  name,
  value,
  onChange,
  helperText,
  error,
  required = false,
  optional = false,
  disabled = false,
  placeholder,
}: PhoneFieldProps) => {
  const inputId = `field-${name}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1 mb-4">
      <label
        htmlFor={inputId}
        className="block text-sm text-text-muted mb-1.5 md:mb-2 font-medium"
      >
        {label}
        {optional && (
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        )}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <PhoneInputControl
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        invalid={!!error}
        describedBy={[helperId, errorId].filter(Boolean).join(" ") || undefined}
        countryLabel={`${label} country`}
      />

      {helperText && !error && (
        <p id={helperId} className="text-xs text-gray-500 mt-1">
          {helperText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="text-xs text-red-500 mt-1"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Validate a phone number for form submission.
 *
 * Returns an error message, or undefined when acceptable. Optional fields
 * accept empty; required fields do not. Anything non-empty must be a real,
 * dialable number per libphonenumber's metadata rather than a digit-count
 * heuristic.
 */
export function validatePhone(
  value: string,
  { required = false }: { required?: boolean } = {},
): string | undefined {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return required ? "Phone number is required" : undefined;
  }

  if (!isValidPhoneNumber(trimmed)) {
    return "Please enter a valid phone number";
  }

  return undefined;
}

export default PhoneField;

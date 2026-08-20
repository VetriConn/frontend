"use client";

import clsx from "clsx";
import {
  FIELD_BASE,
  fieldBorder,
  FIELD_DISABLED,
  FIELD_LABEL,
  FIELD_HELPER,
  FIELD_ERROR,
  FIELD_WRAPPER,
} from "./fieldStyles";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "select";
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  options?: { value: string; label: string }[];
  disabled?: boolean;
}

export const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  helperText,
  error,
  required = false,
  optional = false,
  value,
  onChange,
  options = [],
  disabled = false,
}: FormFieldProps) => {
  const inputId = `field-${name}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const inputClasses = clsx(
    FIELD_BASE,
    fieldBorder(!!error),
    disabled && FIELD_DISABLED
  );

  return (
    <div className={FIELD_WRAPPER}>
      <label
        htmlFor={inputId}
        className={FIELD_LABEL}
      >
        {label}
        {optional && (
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        )}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "select" ? (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          disabled={disabled}
          aria-describedby={
            [helperId, errorId].filter(Boolean).join(" ") || undefined
          }
          aria-invalid={!!error}
        >
          <option value="" disabled>
            {placeholder || "Select an option"}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClasses}
          disabled={disabled}
          aria-describedby={
            [helperId, errorId].filter(Boolean).join(" ") || undefined
          }
          aria-invalid={!!error}
        />
      )}

      {helperText && !error && (
        <p id={helperId} className={FIELD_HELPER}>
          {helperText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className={FIELD_ERROR}
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

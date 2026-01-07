"use client";

import clsx from "clsx";

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

  const baseInputClasses =
    "block w-full py-3 px-4 border rounded-[10px] text-base outline-none transition-colors focus:border-primary bg-white";

  const inputClasses = clsx(
    baseInputClasses,
    error ? "border-red-500" : "border-gray-300",
    disabled && "bg-gray-100 cursor-not-allowed"
  );

  return (
    <div className="flex flex-col gap-1 mb-4">
      <label
        htmlFor={inputId}
        className="block text-sm text-text-muted mb-1 font-medium"
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

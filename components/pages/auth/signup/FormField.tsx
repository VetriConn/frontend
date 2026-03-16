"use client";

import React from "react";

type Option = { value: string; label: string };

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  type?: "text" | "email" | "tel" | "select";
  required?: boolean;
  optional?: boolean;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  options?: Option[];
}

export function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  optional,
  helperText,
  error,
  disabled,
  options = [],
}: FormFieldProps) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-800">
        {label} {required && <span>*</span>}{" "}
        {optional && <span>(optional)</span>}
      </label>

      {type === "select" ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className={`w-full rounded-lg border px-3 py-2 text-sm ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className={`w-full rounded-lg border px-3 py-2 text-sm ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
      )}

      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-500">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

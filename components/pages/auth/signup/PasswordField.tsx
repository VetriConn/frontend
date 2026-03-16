"use client";

import React, { useMemo, useState } from "react";

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  showRequirements?: boolean;
}

export function PasswordField({
  label,
  name,
  value,
  onChange,
  helperText,
  error,
  disabled,
  showRequirements,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const requirements = useMemo(
    () => [
      { label: "At least 8 characters", pass: value.length >= 8 },
      { label: "At least one uppercase letter", pass: /[A-Z]/.test(value) },
      { label: "At least one lowercase letter", pass: /[a-z]/.test(value) },
      { label: "At least one number", pass: /\d/.test(value) },
    ],
    [value],
  );

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-800">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full rounded-lg border px-3 py-2 pr-12 text-sm ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-500">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-gray-500">
          {helperText}
        </p>
      ) : null}

      {showRequirements && (
        <ul className="space-y-1 text-xs text-gray-600">
          {requirements.map((item) => (
            <li key={item.label}>{item.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

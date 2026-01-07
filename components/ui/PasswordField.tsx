"use client";

import { useState } from "react";
import clsx from "clsx";

interface PasswordFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  showRequirements?: boolean;
  disabled?: boolean;
}

interface PasswordRequirement {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    key: "minLength",
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    key: "uppercase",
    label: "At least one uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    key: "lowercase",
    label: "At least one lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    key: "number",
    label: "At least one number",
    test: (password) => /[0-9]/.test(password),
  },
];

export const PasswordField = ({
  label,
  name,
  placeholder,
  helperText,
  error,
  value,
  onChange,
  showRequirements = false,
  disabled = false,
}: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const inputId = `field-${name}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const toggleVisibility = () => setIsVisible(!isVisible);

  const inputClasses = clsx(
    "block w-full py-3 px-4 pr-12 border rounded-[10px] text-base outline-none transition-colors focus:border-primary bg-white",
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
      </label>

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={isVisible ? "text" : "password"}
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
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label={isVisible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {isVisible ? (
            <EyeOffIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {helperText && !error && !showRequirements && (
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

      {showRequirements && (
        <div className="mt-2 space-y-1">
          {PASSWORD_REQUIREMENTS.map((req) => {
            const isMet = req.test(value);
            return (
              <div
                key={req.key}
                className={clsx(
                  "flex items-center gap-2 text-xs transition-colors",
                  isMet ? "text-gray-700" : "text-gray-400"
                )}
              >
                <span
                  className={clsx(
                    "flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold transition-all",
                    isMet
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-300"
                  )}
                >
                  ✓
                </span>
                <span>{req.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Eye icon component
const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

// Eye off icon component
const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const CustomDropdown = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  options,
  error,
  required = false,
  helperText,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Dropdown Container */}
      <div ref={dropdownRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          id={name}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={clsx(
            "w-full px-4 py-3 text-left bg-white border rounded-[10px] transition-all",
            "flex items-center justify-between",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 hover:border-gray-400",
            !selectedOption && "text-gray-400"
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={clsx(selectedOption ? "text-gray-900" : "text-gray-400")}>
            {displayValue}
          </span>
          <ChevronIcon className={clsx("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[10px] shadow-lg overflow-hidden"
            role="listbox"
          >
            {/* Header */}
            <div className="bg-primary text-white px-4 py-3 font-medium text-sm">
              {placeholder}
            </div>

            {/* Options */}
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={clsx(
                    "w-full px-4 py-3 text-left text-sm transition-colors",
                    "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                    value === option.value
                      ? "bg-red-50 text-primary font-medium"
                      : "text-gray-700"
                  )}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Chevron icon
const ChevronIcon = ({ className }: { className?: string }) => (
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
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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

interface DropdownOption {
  value: string;
  /**
   * A string, or a node when the option should render something the trigger
   * cannot spell — the job-seeking statuses show the same badge here that
   * lands on the profile, so choosing one previews the result.
   */
  label: React.ReactNode;
  /**
   * What the trigger shows and search compares against when `label` is a node.
   * Required only in that case; a string label is its own text.
   */
  searchText?: string;
}

interface CustomDropdownProps {
  label?: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  error?: string;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
  hideHeader?: boolean;
  openUpward?: boolean;
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
  disabled = false,
  hideHeader = false,
  openUpward = false,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  // The trigger is a single line of text, so a node label needs its plain
  // form; a string label already is one.
  const displayValue: React.ReactNode = selectedOption
    ? (selectedOption.searchText ?? selectedOption.label)
    : placeholder;

  // A search box appears only for long lists (like the full country list) so
  // short menus stay clutter-free. It compares the plain searchText, so a
  // flag-plus-name node label still matches when you type the name.
  const [query, setQuery] = useState("");
  const showSearch = options.length > 8;
  const filteredOptions =
    showSearch && query.trim()
      ? options.filter((opt) => {
          const text =
            opt.searchText ??
            (typeof opt.label === "string" ? opt.label : opt.value);
          return text.toLowerCase().includes(query.trim().toLowerCase());
        })
      : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  // Clear the filter each time the menu closes.
  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const dropdownMenu = isOpen && (
    <div
      ref={dropdownRef}
      className={clsx(
        "absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
      )}
      style={{
        width: coords.width,
        left: coords.left,
        top: openUpward
          ? coords.top - (options.length * 40 + (hideHeader ? 0 : 44)) - 8 + window.scrollY
          : coords.top + 36 + window.scrollY, // Fallback offsets adjusted for window scroll
        position: "absolute",
      }}
      role="listbox"
    >
      {/* Header */}
      {!hideHeader && (
        <div className="bg-primary text-white px-4 py-3 font-medium text-sm">
          {placeholder}
        </div>
      )}

      {/* Search — long lists only */}
      {showSearch && (
        <div className="border-b border-gray-100 p-2">
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            aria-label={`Search ${label ?? "options"}`}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* Options */}
      <div className="max-h-60 overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <p className="px-4 py-3 text-xs text-gray-400">No matches</p>
        ) : (
          filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={clsx(
                "flex w-full items-center px-4 py-2.5 text-left text-xs transition-colors",
                "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                value === option.value
                  ? "bg-red-50 text-primary font-medium"
                  : "text-gray-700",
              )}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className={clsx("w-full", FIELD_WRAPPER)}>
      {/* Label */}
      {label && (
        <label htmlFor={name} className={FIELD_LABEL}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Dropdown Container */}
      <div className="relative">
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          id={name}
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={clsx(
            // Same box as a text input — see fieldStyles.
            FIELD_BASE,
            "text-left flex items-center justify-between gap-2",
            disabled ? FIELD_DISABLED : fieldBorder(!!error),
            !disabled && !error && "hover:border-gray-400",
            error && "focus:ring-red-500",
            !selectedOption && "text-gray-400"
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={clsx(selectedOption ? "text-gray-900 font-medium" : "text-gray-400")}>
            {displayValue}
          </span>
          <ChevronIcon className={clsx("w-4 h-4 text-gray-400 transition-transform shrink-0", isOpen && "rotate-180")} />
        </button>

        {/* Portal drop container */}
        {typeof document !== "undefined" && createPortal(dropdownMenu, document.body)}
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p className={FIELD_HELPER}>{helperText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className={FIELD_ERROR} role="alert">
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

"use client";

import { useState, useRef, useEffect, useId, useCallback } from "react";
import clsx from "clsx";
import {
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineArrowPath,
  HiOutlineChevronDown,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineXMark,
} from "react-icons/hi2";

interface FilterState {
  location: string;
  jobType: string;
  experienceLevel: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

interface FilterOption {
  value: string;
  label: string;
}

// Filter options
const LOCATION_OPTIONS: FilterOption[] = [
  { value: "", label: "Any location" },
  { value: "remote", label: "Remote" },
  { value: "new-york", label: "New York" },
  { value: "los-angeles", label: "Los Angeles" },
  { value: "chicago", label: "Chicago" },
  { value: "san-francisco", label: "San Francisco" },
];

const JOB_TYPE_OPTIONS: FilterOption[] = [
  { value: "", label: "Any type" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "flexible", label: "Flexible" },
];

const EXPERIENCE_OPTIONS: FilterOption[] = [
  { value: "", label: "Any level" },
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "executive", label: "Executive" },
];

interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder: string;
  icon: React.ReactNode;
}

const FilterDropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon,
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const buttonId = useId();
  const listboxId = useId();

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;
  const selectedIndex = options.findIndex((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus the selected or first option when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const indexToFocus = selectedIndex >= 0 ? selectedIndex : 0;
      setFocusedIndex(indexToFocus);
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        optionRefs.current[indexToFocus]?.focus();
      }, 10);
    }
  }, [isOpen, selectedIndex]);

  const handleSelect = useCallback((optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  }, [onChange]);

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        break;
      case "ArrowUp":
        e.preventDefault();
        setIsOpen(true);
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        handleSelect(options[index].value);
        break;
      case "ArrowDown":
        e.preventDefault();
        const nextIndex = index < options.length - 1 ? index + 1 : 0;
        setFocusedIndex(nextIndex);
        optionRefs.current[nextIndex]?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : options.length - 1;
        setFocusedIndex(prevIndex);
        optionRefs.current[prevIndex]?.focus();
        break;
      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        optionRefs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        const lastIndex = options.length - 1;
        setFocusedIndex(lastIndex);
        optionRefs.current[lastIndex]?.focus();
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        // Return focus to the button
        document.getElementById(buttonId)?.focus();
        break;
      case "Tab":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div className="mb-4">
      <label
        id={`${buttonId}-label`}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
      >
        <span className="text-gray-500" aria-hidden="true">{icon}</span>
        {label}
      </label>
      <div ref={dropdownRef} className="relative">
        <button
          id={buttonId}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleButtonKeyDown}
          className={clsx(
            "w-full px-4 py-3 text-left bg-white border rounded-lg transition-all",
            "flex items-center justify-between",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "border-gray-200 hover:border-gray-300",
            !selectedOption?.value && "text-gray-400"
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${buttonId}-label`}
          aria-controls={isOpen ? listboxId : undefined}
        >
          <span className={clsx(selectedOption?.value ? "text-gray-900" : "text-gray-400")}>
            {displayValue}
          </span>
          <HiOutlineChevronDown
            className={clsx(
              "w-5 h-5 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            ref={listboxRef}
            id={listboxId}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            role="listbox"
            aria-labelledby={`${buttonId}-label`}
            aria-activedescendant={focusedIndex >= 0 ? `${listboxId}-option-${focusedIndex}` : undefined}
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  ref={(el) => { optionRefs.current[index] = el; }}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  onKeyDown={(e) => handleOptionKeyDown(e, index)}
                  className={clsx(
                    "w-full px-4 py-3 text-left text-sm transition-colors",
                    "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                    value === option.value
                      ? "bg-red-50 text-primary font-medium"
                      : "text-gray-700",
                    focusedIndex === index && "bg-gray-100"
                  )}
                  role="option"
                  aria-selected={value === option.value}
                  tabIndex={-1}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Filter content component (shared between desktop and mobile)
const FilterContent = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: FilterPanelProps) => {
  const handleLocationChange = (value: string) => {
    onFilterChange({ ...filters, location: value });
  };

  const handleJobTypeChange = (value: string) => {
    onFilterChange({ ...filters, jobType: value });
  };

  const handleExperienceLevelChange = (value: string) => {
    onFilterChange({ ...filters, experienceLevel: value });
  };

  return (
    <>
      {/* Location Filter */}
      <FilterDropdown
        label="Location"
        value={filters.location}
        onChange={handleLocationChange}
        options={LOCATION_OPTIONS}
        placeholder="Any location"
        icon={<HiOutlineMapPin className="w-4 h-4" />}
      />

      {/* Job Type Filter */}
      <FilterDropdown
        label="Job Type"
        value={filters.jobType}
        onChange={handleJobTypeChange}
        options={JOB_TYPE_OPTIONS}
        placeholder="Any type"
        icon={<HiOutlineBriefcase className="w-4 h-4" />}
      />

      {/* Experience Level Filter */}
      <FilterDropdown
        label="Experience Level"
        value={filters.experienceLevel}
        onChange={handleExperienceLevelChange}
        options={EXPERIENCE_OPTIONS}
        placeholder="Any level"
        icon={<HiOutlineUser className="w-4 h-4" />}
      />

      {/* Apply Filters Button */}
      <button
        type="button"
        onClick={onApplyFilters}
        className="btn-primary w-full mt-4 min-h-[48px]"
      >
        Apply Filters
      </button>

      {/* Clear All Link */}
      <button
        type="button"
        onClick={onClearFilters}
        className="flex items-center justify-center gap-2 w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors min-h-[44px]"
      >
        <HiOutlineArrowPath className="w-4 h-4" />
        <span>Clear all</span>
      </button>
    </>
  );
};

export const FilterPanel = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: FilterPanelProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Count active filters for badge display
  const activeFilterCount = [
    filters.location,
    filters.jobType,
    filters.experienceLevel,
  ].filter(Boolean).length;

  // Close mobile drawer when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleApplyFilters = () => {
    onApplyFilters();
    setIsMobileOpen(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <>
      {/* Mobile Filter Toggle Button - visible only on mobile */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className={clsx(
          "md:hidden w-full flex items-center justify-center gap-2",
          "bg-white border border-gray-200 rounded-xl p-4",
          "text-gray-700 font-medium",
          "hover:bg-gray-50 transition-colors",
          "min-h-[48px]"
        )}
        aria-expanded={isMobileOpen}
        aria-controls="mobile-filter-drawer"
      >
        <HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
        <span>Filter Jobs</span>
        {activeFilterCount > 0 && (
          <span className="bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Drawer/Modal */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filter-title"
          id="mobile-filter-drawer"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 id="mobile-filter-title" className="heading-3">
                Filter Jobs
              </h2>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close filters"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6">
              <FilterContent
                filters={filters}
                onFilterChange={onFilterChange}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filter Panel - hidden on mobile */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl p-6">
        {/* Heading */}
        <h2 className="heading-3 mb-6">Filter Jobs</h2>

        <FilterContent
          filters={filters}
          onFilterChange={onFilterChange}
          onApplyFilters={onApplyFilters}
          onClearFilters={onClearFilters}
        />
      </div>
    </>
  );
};

export default FilterPanel;

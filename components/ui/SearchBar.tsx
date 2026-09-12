"use client";

import { useId, KeyboardEvent } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  /**
   * A search is on its way back. The button is the thing that was clicked, so
   * it is the thing that has to answer. A dimmed list further down the page
   * is not an acknowledgement of the click.
   */
  isSearching?: boolean;
}

/**
 * Composite search field: icon + input + submit live in one shell. Focus is
 * drawn on that shell (`focus-within`), never on the naked input. The global
 * `:focus-visible` rule in globals.css is primary-red and equal-specificity
 * to Tailwind's `outline-none`, so a bare input still painted red vertical
 * slivers inside `overflow-hidden`. `.search-bar-input` opts out with higher
 * specificity; the shell keeps the product's gray focus ring.
 */
export const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search jobs by title, company, or keyword...",
  isSearching = false,
}: SearchBarProps) => {
  const inputId = useId();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSearching) {
      onSearch();
    }
  };

  return (
    <div
      className="w-full flex flex-col sm:flex-row items-stretch bg-white border border-gray-200 rounded-xl shadow-sm transition-[border-color,box-shadow] focus-within:border-gray-500 focus-within:ring-2 focus-within:ring-gray-300/60"
      role="search"
      aria-label="Job search"
    >
      <div className="flex items-center flex-1 min-w-0 gap-3 px-4">
        <label htmlFor={inputId} className="sr-only">
          Search jobs by title, company, or keyword
        </label>
        <HiOutlineMagnifyingGlass
          className="w-5 h-5 md:w-6 md:h-6 text-gray-400 shrink-0"
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-bar-input flex-1 min-w-0 py-3 text-base bg-transparent text-gray-900 placeholder:text-gray-400 min-h-12 border-0 shadow-none ring-0"
          aria-describedby={`${inputId}-description`}
        />
        <span id={`${inputId}-description`} className="sr-only">
          Press Enter or click Search to find jobs
        </span>
      </div>
      <button
        type="button"
        onClick={onSearch}
        disabled={isSearching}
        aria-busy={isSearching}
        // Fixed min-width to the wider label so the control does not jump
        // sideways when the label flips to "Searching…".
        className="btn-primary rounded-b-xl sm:rounded-none sm:rounded-r-xl px-6 py-3 min-h-12 border-t sm:border-t-0 border-gray-200 inline-flex items-center justify-center gap-2 sm:min-w-[8.5rem] disabled:opacity-90 disabled:cursor-wait"
      >
        {isSearching && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {isSearching ? "Searching…" : "Search"}
      </button>
    </div>
  );
};

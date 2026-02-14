"use client";

import { useId, KeyboardEvent } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search jobs by title, company, or keyword...",
}: SearchBarProps) => {
  const inputId = useId();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div
      className="w-full flex flex-col sm:flex-row items-stretch bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
      role="search"
      aria-label="Job search"
    >
      <div className="flex items-center flex-1 px-4">
        <label htmlFor={inputId} className="sr-only">
          Search jobs by title, company, or keyword
        </label>
        <HiOutlineMagnifyingGlass
          className="w-5 h-5 text-gray-400 flex-shrink-0"
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 py-3 sm:py-3 px-3 text-base outline-none bg-transparent text-gray-900 placeholder:text-gray-400 min-h-[48px]"
          aria-describedby={`${inputId}-description`}
        />
        <span id={`${inputId}-description`} className="sr-only">
          Press Enter or click Search to find jobs
        </span>
      </div>
      <button
        type="button"
        onClick={onSearch}
        className="btn-primary rounded-none sm:rounded-none px-6 py-3 min-h-[48px] border-t sm:border-t-0 border-gray-200"
      >
        Search
      </button>
    </div>
  );
};

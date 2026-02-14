"use client";

import React from "react";
import clsx from "clsx";

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

export const LoadMoreButton = ({
  onClick,
  isLoading,
  hasMore,
}: LoadMoreButtonProps) => {
  // Hide button when no more jobs are available
  if (!hasMore) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-busy={isLoading}
      aria-label={isLoading ? "Loading more jobs" : "Load more jobs"}
      className={clsx(
        "w-full sm:w-auto px-6 py-3",
        "bg-white border border-gray-200 rounded-lg",
        "text-gray-700 font-medium text-sm",
        "hover:bg-gray-50 hover:border-gray-300",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "transition-colors duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "flex items-center justify-center gap-2",
        "min-h-[48px]"
      )}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-gray-500"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <span>Load more jobs</span>
      )}
    </button>
  );
};

export default LoadMoreButton;

"use client";
import React from "react";
import { HiOutlineExclamationTriangle, HiOutlineArrowPath } from "react-icons/hi2";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an error while loading your data.",
  onRetry,
  showRetry = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-8 text-center tablet:min-h-[300px] tablet:py-8 tablet:px-4">
      <div className="max-w-lg w-full">
        <div className="mb-6">
          <HiOutlineExclamationTriangle className="text-6xl text-amber-500 opacity-80 tablet:text-5xl" />
        </div>
        <h2 className="text-xl md:text-3xl font-semibold text-gray-700 mb-3 tablet:text-xl">{title}</h2>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-8 tablet:text-sm">{message}</p>
        {showRetry && onRetry && (
          <button className="inline-flex items-center gap-2 bg-primary text-white border-none py-3 px-6 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0" onClick={onRetry}>
            <HiOutlineArrowPath className="w-4 h-4 md:w-5 md:h-5" /> Try Again
          </button>
        )}
      </div>
    </div>
  );
};

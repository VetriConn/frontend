"use client";

import clsx from "clsx";
import { KeyboardEvent } from "react";

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export const RoleCard = ({
  icon,
  title,
  description,
  selected,
  onSelect,
}: RoleCardProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-pressed={selected}
      className={clsx(
        "relative flex flex-col items-start p-6 border-2 rounded-xl cursor-pointer transition-all w-full",
        "focus:outline-none",
        !selected && "bg-white border-gray-300 hover:border-gray-400",
        selected && "bg-red-50 border-primary"
      )}
    >
      {/* Checkmark for selected state */}
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <CheckIcon className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Icon */}
      <div
        className={clsx(
          "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
          selected ? "bg-red-100" : "bg-gray-100"
        )}
      >
        <span className={clsx(selected ? "text-primary" : "text-gray-600")}>
          {icon}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 text-gray-900">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
};

// Check icon component
const CheckIcon = ({ className }: { className?: string }) => (
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
      strokeWidth={3}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

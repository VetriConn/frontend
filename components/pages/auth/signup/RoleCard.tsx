"use client";

import React from "react";

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export function RoleCard({
  icon,
  title,
  description,
  selected,
  disabled,
  onSelect,
}: RoleCardProps) {
  const handleClick = () => {
    if (disabled) return;
    onSelect();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={selected}
      aria-disabled={disabled ? "true" : "false"}
      tabIndex={disabled ? -1 : 0}
      className={`w-full text-left rounded-xl border p-4 ${
        selected ? "border-primary bg-red-50" : "border-gray-200 bg-white"
      } ${disabled ? "opacity-60" : "hover:bg-gray-50"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </div>
        {disabled && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            Coming Soon
          </span>
        )}
      </div>
    </button>
  );
}

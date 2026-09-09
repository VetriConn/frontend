"use client";

import React from "react";
import { HiCheck } from "react-icons/hi2";

export function VerticalStepper({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: readonly { number: number; label: string }[];
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <nav aria-label="Progress">
      <ol className="relative">
        {steps.map((step, i) => {
          const isComplete = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isLast = i === steps.length - 1;
          const clickable = isComplete;
          return (
            <li key={step.number} className="relative flex pb-4 last:pb-0">
              {/* Vertical connector to the next step */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-4 top-9 -ml-px h-[calc(100%-1.5rem)] w-0.5 ${
                    isComplete ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => clickable && onStepClick(step.number)}
                disabled={!clickable}
                aria-current={isCurrent ? "step" : undefined}
                className={`group flex items-center gap-3 text-left ${
                  clickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isComplete
                      ? "bg-primary text-white group-hover:bg-primary-hover"
                      : isCurrent
                        ? "bg-primary text-white ring-4 ring-red-100"
                        : "border-2 border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {isComplete ? <HiCheck className="h-4 w-4" /> : step.number}
                </span>
                <span className="min-h-[44px] flex flex-col justify-center py-1">
                  <span
                    className={`text-sm font-medium ${
                      isCurrent
                        ? "text-gray-900"
                        : isComplete
                          ? "text-gray-700 group-hover:text-primary"
                          : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {isComplete ? "Completed" : isCurrent ? "In progress" : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Main Wizard Component ───────────────────────────────────────────────────

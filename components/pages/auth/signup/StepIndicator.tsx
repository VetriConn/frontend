"use client";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepName: string;
}

/**
 * A minimal step header: a short accent rule, then an "N/total" counter — the
 * step's own heading supplies the question beneath it. This replaced a
 * full-width progress bar with a redundant "Step N of N" plus step-name row;
 * the count carries the progress, so the bar earned its removal.
 *
 * The rule is theme red, not the survey reference's green.
 */
export const StepIndicator = ({
  currentStep,
  totalSteps,
  stepName,
}: StepIndicatorProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div>
      {/* A compact bar whose red fill grows with each step — not a fixed
          stub. The faint track shows the distance still to go, so step 1
          reads as a bar barely filled rather than "a short line". */}
      <div className="h-1 w-40 max-w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Step ${currentStep} of ${totalSteps}: ${stepName}`}
        />
      </div>
      <p className="mt-2 text-sm font-medium text-gray-400 tabular-nums">
        {currentStep}/{totalSteps}
      </p>
    </div>
  );
};

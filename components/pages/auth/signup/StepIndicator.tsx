"use client";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepName: string;
}

export const StepIndicator = ({
  currentStep,
  totalSteps,
  stepName,
}: StepIndicatorProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-3">
        <span className="font-open-sans text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="font-open-sans text-sm font-medium text-gray-800">
          {stepName}
        </span>
      </div>
      <div
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep} of ${totalSteps}: ${stepName}`}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

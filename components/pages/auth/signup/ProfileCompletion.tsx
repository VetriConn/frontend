"use client";

interface ProfileCompletionProps {
  percentage: number;
}

export const ProfileCompletion = ({ percentage }: ProfileCompletionProps) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const showHelperText = clampedPercentage < 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="font-open-sans text-sm text-gray-600">
          Profile Completion
        </span>
        <span className="font-open-sans text-lg font-semibold text-primary">
          {Math.round(clampedPercentage)}%
        </span>
      </div>
      <div
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Profile ${Math.round(clampedPercentage)}% complete`}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {showHelperText && (
        <p className="font-open-sans text-sm text-gray-500 mt-3 text-center">
          Complete your profile to improve your chances of finding the right match.
        </p>
      )}
    </div>
  );
};

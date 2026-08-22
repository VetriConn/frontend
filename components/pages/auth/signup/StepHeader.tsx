"use client";

import { StepIndicator } from "./StepIndicator";

/**
 * A step's header: title, optional subtitle, then the progress indicator —
 * in that order, so the "N/total" sits directly above the form, matching the
 * survey-style reference.
 *
 * The title is sized to the sign-in page's heading (text-xl md:text-3xl,
 * left-aligned) rather than the outsized centered text-4xl each step used to
 * carry, so the two auth surfaces read as one family. Defined once so all
 * four steps stay in step.
 */
interface StepHeaderProps {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
}

export const StepHeader = ({
  title,
  subtitle,
  currentStep,
  totalSteps,
}: StepHeaderProps) => {
  return (
    <div className="mb-4">
      {/* Progress first, then the title — the count sits above the heading,
          the way the survey reference reads and the more natural order. */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepName={title}
      />
      {/* h2, not h1: the image panel is the page's h1 ("Join the Vetriconn
          community"), matching sign in where the form heading is an h2. */}
      <h2 className="mt-4 text-xl font-semibold text-gray-900 md:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-600 md:text-base">{subtitle}</p>
      )}
    </div>
  );
};

export default StepHeader;

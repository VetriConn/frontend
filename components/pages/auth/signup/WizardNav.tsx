"use client";

/**
 * The wizard's step navigation, in one place.
 *
 * Each step had its own copy of the Back/Continue pair — four near-identical
 * blocks of full-width stacked buttons. This is the single modern version:
 * a compact Back/Continue pair sitting to the right over a hairline divider,
 * with an optional Skip on the left, echoing the survey-style reference.
 *
 * It stays full-width and large-tap on mobile — this board's audience skews
 * older, so a phone should give them a big target, not a tiny desktop pill.
 */

interface WizardNavProps {
  onBack: () => void;
  onNext: () => void;
  /** Disables Continue — e.g. an invalid required step. */
  nextDisabled?: boolean;
  /** Continue label; defaults to "Continue". */
  nextLabel?: string;
  /** When set, renders a Skip affordance on the left. */
  onSkip?: () => void;
  /** Skip label; defaults to "Skip for now". */
  skipLabel?: string;
  /** In-flight: shows "Please wait…" on Continue and disables the row. */
  busy?: boolean;
}

export const WizardNav = ({
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "Continue",
  onSkip,
  skipLabel = "Skip for now",
  busy = false,
}: WizardNavProps) => {
  return (
    <div className="mt-4 pt-4">
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        {onSkip ? (
          <button
            type="button"
            onClick={onSkip}
            disabled={busy}
            className="self-center text-sm text-gray-500 underline underline-offset-2 transition-colors hover:text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed sm:self-auto"
          >
            {skipLabel}
          </button>
        ) : (
          <span className="hidden sm:block" aria-hidden="true" />
        )}

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            className="w-full rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || busy}
            className="w-full rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
          >
            {busy ? "Please wait…" : nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WizardNav;

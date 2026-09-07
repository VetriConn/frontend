"use client";

/**
 * A failed list fetch, said plainly. Rendering the cheerful empty state on an
 * API error told people their data was gone ("No postings yet") when the
 * request had simply failed.
 */
export function ListLoadError({
  what,
  onRetry,
}: {
  /** e.g. "your postings" */
  what: string;
  onRetry: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-red-200 p-10 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Couldn&apos;t load {what}
      </h3>
      <p className="text-gray-600 mb-6">
        Something went wrong on our side. Your data is safe.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center px-5 py-2.5 min-h-[44px] rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover"
      >
        Try again
      </button>
    </div>
  );
}

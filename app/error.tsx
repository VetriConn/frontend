"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary. Without this file every runtime error in
 * production showed Next's unstyled default crash screen (R3 #35) - the one
 * surface guaranteed to appear at the worst possible moment.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 bg-white">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The page hit a problem on our side. Your data is safe - trying again
          usually fixes it.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 min-h-[48px] rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 min-h-[48px] rounded-full border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors no-underline"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}

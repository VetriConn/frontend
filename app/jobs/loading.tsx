import { Header } from "@/components/ui/Header";

/**
 * Route-level loading state: the page is server-rendered, so this shows only
 * during navigation while the job list is fetched. Mirrors the card grid so
 * the swap doesn't jump.
 */
export default function JobsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="sticky top-0 z-50 bg-white">
        <Header />
      </div>
      <main id="main-content"
        className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14"
        aria-busy="true"
        aria-label="Loading jobs"
      >
        <div className="h-8 w-64 bg-gray-200 rounded animate-shimmer mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6 flex flex-col gap-3"
              aria-hidden="true"
            >
              <div className="h-5 md:h-6 w-[55%] bg-gray-200 rounded animate-shimmer" />
              <div className="flex flex-wrap gap-2 md:gap-3">
                <div className="h-3 md:h-4 w-20 md:w-24 bg-gray-200 rounded animate-shimmer" />
                <div className="h-3 md:h-4 w-16 md:w-20 bg-gray-200 rounded animate-shimmer" />
                <div className="h-3 md:h-4 w-18 md:w-22 bg-gray-200 rounded animate-shimmer" />
              </div>
              <div className="h-3 md:h-4 w-full bg-gray-200 rounded animate-shimmer" />
              <div className="h-3 md:h-4 w-[70%] bg-gray-200 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

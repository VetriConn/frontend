"use client";

import React, {
  Suspense,
  useState,
  useCallback,
  useMemo,
  useRef,
  
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineBookmarkSquare,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterPanel } from "@/components/ui/FilterPanel";
import { JobResultsList } from "@/components/ui/JobResultsList";
import { Pagination } from "@/components/ui/Pagination";
import { useJobs } from "@/hooks/useJobs";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useToaster } from "@/components/ui/Toaster";

// Filter state interface
interface FilterState {
  location: string;
  jobType: string;
  experienceLevel: string;
  arrangement: string;
}

// Initial filter state
const initialFilters: FilterState = {
  location: "",
  jobType: "",
  experienceLevel: "",
  arrangement: "",
};

// URL parameter keys
const URL_PARAMS = {
  search: "q",
  location: "location",
  jobType: "type",
  experienceLevel: "experience",
  arrangement: "arrangement",
} as const;

// Page size for pagination
const PAGE_SIZE = 6;

const SearchResultsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToaster();
  const { addSearch, hasSearch } = useSavedSearches();

  // Parse initial state from URL parameters
  const getInitialFiltersFromUrl = useCallback((): FilterState => {
    return {
      location: searchParams.get(URL_PARAMS.location) || "",
      jobType: searchParams.get(URL_PARAMS.jobType) || "",
      experienceLevel: searchParams.get(URL_PARAMS.experienceLevel) || "",
      arrangement: searchParams.get(URL_PARAMS.arrangement) || "",
    };
  }, [searchParams]);

  const getInitialSearchFromUrl = useCallback((): string => {
    return searchParams.get(URL_PARAMS.search) || "";
  }, [searchParams]);

  // Search query state - initialize from URL
  const [searchQuery, setSearchQuery] = useState(() =>
    getInitialSearchFromUrl(),
  );
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(() =>
    getInitialSearchFromUrl(),
  );

  // Filter state - initialize from URL
  const [filters, setFilters] = useState<FilterState>(() =>
    getInitialFiltersFromUrl(),
  );
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() =>
    getInitialFiltersFromUrl(),
  );

  // Which page the server should return. This was a displayCount that revealed
  // more of an already-fetched list; the page now asks for one page at a time.
  const [currentPage, setCurrentPage] = useState(1);

  // Update URL when filters or search change
  const updateUrlParams = useCallback(
    (search: string, filterState: FilterState) => {
      const params = new URLSearchParams();

      if (search) {
        params.set(URL_PARAMS.search, search);
      }
      if (filterState.location) {
        params.set(URL_PARAMS.location, filterState.location);
      }
      if (filterState.jobType) {
        params.set(URL_PARAMS.jobType, filterState.jobType);
      }
      if (filterState.experienceLevel) {
        params.set(URL_PARAMS.experienceLevel, filterState.experienceLevel);
      }
      if (filterState.arrangement) {
        params.set(URL_PARAMS.arrangement, filterState.arrangement);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;

      // Use router.replace to update URL without adding to history stack
      router.replace(newUrl, { scroll: false });
    },
    [router],
  );

  // Fetch jobs using the useJobs hook with search parameter
  const {
    jobs: allJobs,
    isLoading,
    isError,
    isRefreshing,
    mutate,
    total: totalJobs,
    totalPages,
    searchingMore,
  } = useJobs({
    page: currentPage,
    limit: PAGE_SIZE,
    jobType: appliedFilters.jobType || undefined,
    experience: appliedFilters.experienceLevel || undefined,
    arrangement: appliedFilters.arrangement || undefined,
    search: appliedSearchQuery || undefined,
    location: appliedFilters.location || undefined,
  });

  const effectiveJobs = allJobs;
  const effectiveError = isError;

  // Filter jobs based on applied filters (client-side filtering for job type and experience)

  // Handle search
  const handleSearch = useCallback(() => {
    setAppliedSearchQuery(searchQuery);
    setCurrentPage(1); // A new search starts at page one
    updateUrlParams(searchQuery, appliedFilters);
  }, [searchQuery, appliedFilters, updateUrlParams]);

  // Handle filter change (updates local state, not applied yet)
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Handle apply filters
  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setCurrentPage(1); // A new filter starts at page one
    updateUrlParams(appliedSearchQuery, filters);
  }, [filters, appliedSearchQuery, updateUrlParams]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setCurrentPage(1);
    updateUrlParams(appliedSearchQuery, initialFilters);
  }, [appliedSearchQuery, updateUrlParams]);

  // Handle page change
  const resultsRef = useRef<HTMLDivElement>(null);

  const handlePageChange = useCallback((nextPage: number) => {
    setCurrentPage(nextPage);
    // The results column scrolls now, not the window — scrolling the window
    // would do nothing and leave the reader partway down the new page.
    resultsRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    mutate();
  }, [mutate]);

  // Handle apply for a job
  const handleApply = useCallback(
    (jobId: string) => {
      router.push(`/jobs/${jobId}/apply`);
    },
    [router],
  );

  // Handle save search
  const currentSearchFilters = useMemo(
    () => ({
      keyword: appliedSearchQuery || undefined,
      location: appliedFilters.location || undefined,
      jobType: appliedFilters.jobType || undefined,
      experienceLevel: appliedFilters.experienceLevel || undefined,
      arrangement: appliedFilters.arrangement || undefined,
    }),
    [appliedSearchQuery, appliedFilters],
  );

  const isCurrentSearchSaved = hasSearch(currentSearchFilters);
  const hasActiveFilters =
    !!appliedSearchQuery ||
    !!appliedFilters.location ||
    !!appliedFilters.jobType ||
    !!appliedFilters.experienceLevel ||
    !!appliedFilters.arrangement;

  const handleSaveSearch = useCallback(() => {
    addSearch(currentSearchFilters);
    showToast({
      type: "success",
      title: "Search saved",
      description: "You can access it from Saved Searches in the menu.",
    });
  }, [currentSearchFilters, addSearch, showToast]);

  // The page itself no longer grows with the results. The header and the
  // filters hold their place and only the list scrolls, so the controls stay
  // reachable however far down the list you are.
  //
  // The height is pure CSS: 100dvh minus the dashboard chrome above and below
  // — 66px of fixed parts (logo 64px + two borders) plus the rem-sized parts
  // (navbar/breadcrumb padding, breadcrumb line, layout main's py-6/py-8:
  // 7rem, 8rem at md). Split px/rem so the app's own accessibility text-size
  // setting (which scales the root font-size, and with it all that rem
  // chrome) keeps the shell exactly fitting instead of overflowing. No
  // post-mount remeasure, no resize listener; dvh tracks the mobile URL-bar
  // collapse that vh ignores. The constants live in the shared layout — if
  // its chrome changes, retune these two calc()s.
  //
  // The floor is 20rem, not the 320px it used to be. Identical length at the
  // default root size, so nothing moves for a reader at 100% — but it was the
  // one term in these two expressions that ignored the text-size setting,
  // while everything it has to cover is rem and grows with it: the back link,
  // the h1, the subtitle, the SearchBar and the save-search row all live
  // INSIDE the shell, unlike the chrome subtracted above. At 125% on a short
  // window the shell stayed pinned at 320px while that in-shell header grew
  // past two thirds of it, leaving the results column less than one card — on
  // the one setting a reader picks precisely because they need more room to
  // read. The floor still does not reserve a card ON TOP OF that header:
  // sizing it that way would push the shell past a short viewport for the
  // 100% reader, which is a worse bug than the one it would fix.
  return (
    <div
      className="flex flex-col bg-gray-50 overflow-hidden h-[max(20rem,calc(100dvh-66px-7rem))] md:h-[max(20rem,calc(100dvh-66px-8rem))]"
    >
      {/* Main Content */}
      <main id="main-content" className="flex-1 min-h-0 flex flex-col" tabIndex={-1}>
        <div className="w-full flex-1 min-h-0 flex flex-col pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors no-underline mb-3"
          >
            <HiOutlineArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            Back to Dashboard
          </Link>

          {/* Page Header */}
          <header className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight tracking-tight mb-1">
              Browse Jobs
            </h1>
            <p className="text-gray-600 text-sm">
              Browse flexible positions designed for experienced professionals
              like you.
            </p>
          </header>

          {/* Search Bar */}
          <div className="mb-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isSearching={isLoading || isRefreshing}
            />

            {/* Save Search Button */}
            {hasActiveFilters && (
              <div className="flex items-center gap-3 mt-2">
                {isCurrentSearchSaved ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <HiOutlineBookmarkSquare className="w-4 h-4" />
                    Search saved
                  </span>
                ) : (
                  <button
                    onClick={handleSaveSearch}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium cursor-pointer transition-colors"
                  >
                    <HiOutlineBookmarkSquare className="w-4 h-4" />
                    Save this search
                  </button>
                )}
                <Link
                  href="/dashboard/saved-searches"
                  className="text-sm text-gray-500 hover:text-gray-600 transition-colors no-underline"
                >
                  View saved searches
                </Link>
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          {/* The split starts at md, which is exactly where FilterPanel swaps
              its one-line mobile button for the full filter card. It used to
              start at lg, and between the two the card stacked above the
              results inside a shell with a definite height — which does not
              work: both are auto-sized rows, auto rows do not shrink to fit,
              so the results row kept its entire content height, the shell's
              overflow-hidden clipped it, and the results column's own
              overflow-y-auto never engaged. Between 768px and 1023px the tail
              of the list and the pagination could not be reached at all.

              A third of the width at md rather than a quarter: a quarter of
              768px leaves the filter column narrower than the controls it
              holds ("Any arrangement" plus its chevron), where a third of it
              is about the same 222px the column already gets at the narrowest
              lg width, so nothing is squeezed into a width it has never had
              to render at.

              Below md the panel really is one short button, so the stack is
              right there — it just has to say so: the row template gives the
              results the space that is LEFT instead of the space it wants,
              which is what lets it scroll inside the shell rather than
              overflow it. From md up there is only one row, so the template
              goes away again and the columns do the work. */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-[auto_minmax(0,1fr)] md:grid-rows-none gap-4 md:gap-6 flex-1 min-h-0">
            {/* Sticky from md so the filters never scroll away, with its own
                overflow in case the filter list outgrows the row. Between md
                and lg that is the normal case rather than the exception — the
                full card is taller than the grid area at those widths — so
                the aside scrolls itself instead of stealing the room the
                results need. */}
            <aside
              className="md:col-span-1 md:self-start md:sticky md:top-0 md:max-h-full md:overflow-y-auto"
              aria-label="Job filters"
            >
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </aside>

            {/* The one scrolling region on the page. pb-6 so the last card and
                the pagination are not flush against the viewport edge. */}
            <div
              ref={resultsRef}
              className="md:col-span-2 lg:col-span-3 min-h-0 overflow-y-auto pb-6"
              // Dimmed and inert while the next page is on its way. Paging
              // scrolled the reader to the top of the page they had just
              // left and gave them nothing — no spinner, no change — for the
              // length of the round trip, which reads as a dead click. The
              // old rows stay legible on purpose; they are simply marked as
              // no longer current.
              aria-busy={isRefreshing || undefined}
            >
              {/* Above the dim, deliberately. The one line that has to stay
                  legible while the results fade is the line explaining why
                  they faded — putting it inside the faded block at 50% opacity
                  would be the least readable text on the page at the moment it
                  matters most, on a board whose readers skew 45+.

                  It takes the place of the result count, which the list holds
                  back while a query is in flight, so nothing jumps. */}
              {isRefreshing && (
                <div
                  role="status"
                  className="flex items-center gap-2 text-sm text-gray-600 mb-4"
                >
                  <svg
                    className="animate-spin h-4 w-4 text-primary shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Searching
                  {appliedSearchQuery ? ` for “${appliedSearchQuery}”` : ""}…
                </div>
              )}
              <div
                className={
                  isRefreshing
                    ? "opacity-50 pointer-events-none transition-opacity duration-150"
                    : "transition-opacity duration-150"
                }
              >
              {/* A thin result is not necessarily the final answer: the
                  server may be fetching more from its sources right now. Say
                  so, rather than letting an empty list read as "nothing
                  exists". */}
              {searchingMore && !isLoading && (
                <div
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 flex items-start gap-3"
                  role="status"
                  aria-live="polite"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200">
                    <HiOutlineMagnifyingGlass className="w-4 h-4 text-primary animate-pulse" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Still looking for more matches
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      We&apos;re searching further afield for
                      {appliedSearchQuery
                        ? ` “${appliedSearchQuery}”`
                        : " this"}
                      . New listings will appear here as we find them.
                    </p>
                  </div>
                </div>
              )}

              <JobResultsList
                jobs={effectiveJobs}
                totalCount={totalJobs}
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                isError={effectiveError}
                onRetry={handleRetry}
                onApply={handleApply}
              />

              </div>

              {/* The pagination stays put while the next page loads. Hiding
                  it made the control vanish from under the cursor, and with
                  keepPreviousData the list below it is still perfectly
                  readable — there was never a reason to take it away. */}
              {!effectiveError && effectiveJobs.length > 0 && (
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  summary={`Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                    currentPage * PAGE_SIZE,
                    totalJobs,
                  )} of ${totalJobs}`}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Suspense boundary at the page level because SearchResultsPage calls
// useSearchParams() directly — Next.js requires a Suspense ancestor for
// this hook during static rendering. Keep this wrapper if refactoring.
export default function SearchResultsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchResultsPage />
    </Suspense>
  );
}

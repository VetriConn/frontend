"use client";

import React, { Suspense, useState, useCallback, useMemo } from "react";
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
import { Job } from "@/types/job";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useToaster } from "@/components/ui/Toaster";

// Filter state interface
interface FilterState {
  location: string;
  jobType: string;
  experienceLevel: string;
}

// Initial filter state
const initialFilters: FilterState = {
  location: "",
  jobType: "",
  experienceLevel: "",
};

// URL parameter keys
const URL_PARAMS = {
  search: "q",
  location: "location",
  jobType: "type",
  experienceLevel: "experience",
} as const;

// Page size for pagination
const PAGE_SIZE = 6;

// Helper function to get job type from tags
/**
 * The employment type a listing actually states, or null.
 *
 * This returned "Full-time" whenever nothing matched — and since scraped jobs
 * carried no tags at all, that was every listing on the board. Not one of the
 * real listings states an employment type, so the label was wrong every time
 * it was shown. The scraper derives these now; an absent one renders nothing.
 */
const getJobType = (job: Job): string | null => {
  const employmentTypes = [
    "full-time", "part-time", "casual", "seasonal", "contract",
  ];
  const found = job.tags.find((tag) =>
    employmentTypes.includes(tag.name.toLowerCase()),
  );
  if (!found) return null;
  return found.name.charAt(0).toUpperCase() + found.name.slice(1);
};

// Helper function to check if job matches experience level
const matchesExperienceLevel = (job: Job, experienceLevel: string): boolean => {
  if (!experienceLevel) return true;

  const description = job.full_description.toLowerCase();
  const role = job.role.toLowerCase();
  const tags = job.tags.map((t) => t.name.toLowerCase());

  const experienceKeywords: Record<string, string[]> = {
    entry: ["entry", "junior", "graduate", "intern", "0-2 years", "1-2 years"],
    mid: ["mid", "intermediate", "2-5 years", "3-5 years", "experienced"],
    senior: ["senior", "lead", "5+ years", "7+ years", "principal"],
    executive: ["executive", "director", "vp", "chief", "head of", "c-level"],
  };

  const keywords = experienceKeywords[experienceLevel] || [];
  return keywords.some(
    (keyword) =>
      description.includes(keyword) ||
      role.includes(keyword) ||
      tags.some((tag) => tag.includes(keyword)),
  );
};

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
    mutate,
    total: totalJobs,
    totalPages,
    searchingMore,
  } = useJobs({
    page: currentPage,
    limit: PAGE_SIZE,
    jobType: appliedFilters.jobType || undefined,
    experience: appliedFilters.experienceLevel || undefined,
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
  const handlePageChange = useCallback((nextPage: number) => {
    setCurrentPage(nextPage);
    // Land at the top of the results rather than mid-list on the new page.
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    }),
    [appliedSearchQuery, appliedFilters],
  );

  const isCurrentSearchSaved = hasSearch(currentSearchFilters);
  const hasActiveFilters =
    !!appliedSearchQuery ||
    !!appliedFilters.location ||
    !!appliedFilters.jobType ||
    !!appliedFilters.experienceLevel;

  const handleSaveSearch = useCallback(() => {
    addSearch(currentSearchFilters);
    showToast({
      type: "success",
      title: "Search saved",
      description: "You can access it from Saved Searches in the menu.",
    });
  }, [currentSearchFilters, addSearch, showToast]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="max-w-screen-xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors no-underline mb-6"
          >
            <HiOutlineArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            Back to Dashboard
          </Link>

          {/* Page Header */}
          <header className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Find Your Next Opportunity
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Browse flexible positions designed for experienced professionals
              like you.
            </p>
          </header>

          {/* Search Bar */}
          <div className="mb-6 sm:mb-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
            />

            {/* Save Search Button */}
            {hasActiveFilters && (
              <div className="flex items-center gap-3 mt-3">
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
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors no-underline"
                >
                  View saved searches
                </Link>
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Filter Panel - Left Sidebar on desktop, toggle button on mobile */}
            <aside className="lg:col-span-1" aria-label="Job filters">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </aside>

            {/* Job Results - Right Content */}
            <div className="lg:col-span-3">
              {/* A thin result is not necessarily the final answer: the
                  server may be fetching more from its sources right now. Say
                  so, rather than letting an empty list read as "nothing
                  exists". */}
              {searchingMore && !isLoading && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-start gap-3">
                  <HiOutlineMagnifyingGlass className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Still looking for more matches
                    </p>
                    <p className="text-sm text-gray-500">
                      We&apos;re searching further afield for
                      {appliedSearchQuery ? ` “${appliedSearchQuery}”` : " this"}
                      . Check back in a moment — new listings are added as we
                      find them.
                    </p>
                  </div>
                </div>
              )}

              <JobResultsList
                jobs={effectiveJobs}
                totalCount={totalJobs}
                isLoading={isLoading}
                isError={effectiveError}
                onRetry={handleRetry}
                onApply={handleApply}
              />

              {!isLoading && !effectiveError && effectiveJobs.length > 0 && (
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

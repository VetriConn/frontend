"use client";

import React, { Suspense, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HiOutlineArrowLeft, HiOutlineBookmarkSquare } from "react-icons/hi2";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterPanel } from "@/components/ui/FilterPanel";
import { JobResultsList } from "@/components/ui/JobResultsList";
import { LoadMoreButton } from "@/components/ui/LoadMoreButton";
import { useJobs } from "@/hooks/useJobs";
import { Job } from "@/types/job";
import { DUMMY_JOBS } from "@/lib/dummy-jobs";
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
const getJobType = (job: Job): string => {
  const jobTypeTags = ["full-time", "part-time", "contract", "flexible"];
  const foundTag = job.tags.find((tag) =>
    jobTypeTags.some((type) => type.toLowerCase() === tag.name.toLowerCase()),
  );
  return foundTag?.name.toLowerCase() || "";
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

  // Pagination state
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
  } = useJobs({
    limit: 100, // Fetch more jobs for client-side filtering
    search: appliedSearchQuery || undefined,
    location: appliedFilters.location || undefined,
  });

  // Fall back to dummy data when API is unavailable
  const dummyJobsList = useMemo(() => Object.values(DUMMY_JOBS), []);
  const effectiveJobs = allJobs.length > 0 ? allJobs : dummyJobsList;
  const effectiveError = false; // Always show dummy data instead of error state

  // Filter jobs based on applied filters (client-side filtering for job type and experience)
  const filteredJobs = useMemo(() => {
    return effectiveJobs.filter((job) => {
      // Filter by job type
      if (appliedFilters.jobType) {
        const jobType = getJobType(job);
        if (jobType !== appliedFilters.jobType.toLowerCase()) {
          return false;
        }
      }

      // Filter by experience level
      if (appliedFilters.experienceLevel) {
        if (!matchesExperienceLevel(job, appliedFilters.experienceLevel)) {
          return false;
        }
      }

      return true;
    });
  }, [effectiveJobs, appliedFilters.jobType, appliedFilters.experienceLevel]);

  // Get displayed jobs based on pagination
  const displayedJobs = useMemo(() => {
    return filteredJobs.slice(0, displayCount);
  }, [filteredJobs, displayCount]);

  // Check if there are more jobs to load
  const hasMore = displayCount < filteredJobs.length;

  // Handle search
  const handleSearch = useCallback(() => {
    setAppliedSearchQuery(searchQuery);
    setDisplayCount(PAGE_SIZE); // Reset pagination on new search
    updateUrlParams(searchQuery, appliedFilters);
  }, [searchQuery, appliedFilters, updateUrlParams]);

  // Handle filter change (updates local state, not applied yet)
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Handle apply filters
  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setDisplayCount(PAGE_SIZE); // Reset pagination on filter change
    updateUrlParams(appliedSearchQuery, filters);
  }, [filters, appliedSearchQuery, updateUrlParams]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setDisplayCount(PAGE_SIZE); // Reset pagination
    updateUrlParams(appliedSearchQuery, initialFilters);
  }, [appliedSearchQuery, updateUrlParams]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    // Simulate a small delay for better UX
    setTimeout(() => {
      setDisplayCount((prev) =>
        Math.min(prev + PAGE_SIZE, filteredJobs.length),
      );
      setIsLoadingMore(false);
    }, 300);
  }, [filteredJobs.length]);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    mutate();
  }, [mutate]);

  // Handle apply for a job
  const handleApply = useCallback(
    (jobId: string) => {
      router.push(`/jobs/${jobId}`);
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
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
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
              <JobResultsList
                jobs={displayedJobs}
                isLoading={isLoading}
                isError={effectiveError}
                onRetry={handleRetry}
                onApply={handleApply}
              />

              {/* Load More Button */}
              {!isLoading && !effectiveError && displayedJobs.length > 0 && (
                <nav
                  className="flex justify-center mt-6 sm:mt-8"
                  aria-label="Pagination"
                >
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                    hasMore={hasMore}
                  />
                </nav>
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

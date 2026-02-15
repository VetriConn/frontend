"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlineBellAlert,
  HiOutlineBellSlash,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBookmarkSquare,
  HiOutlineCalendarDays,
  HiOutlineFunnel,
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
} from "react-icons/hi2";
import {
  useSavedSearches,
  buildSearchUrl,
  type SavedSearch,
} from "@/hooks/useSavedSearches";

// ─── Empty State ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <HiOutlineBookmarkSquare className="w-9 h-9 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        No saved searches yet
      </h3>
      <p className="text-sm text-gray-500 max-w-[380px] leading-relaxed mb-8">
        Save your job searches to quickly access them later. You can also enable
        alerts to get notified about new matches.
      </p>
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors no-underline"
      >
        <HiOutlineMagnifyingGlass className="text-base" />
        Search Jobs
      </Link>
    </div>
  );
}

// ─── Filter Badge ───────────────────────────────────────────────────────────────

function FilterBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
      {icon}
      {label}
    </span>
  );
}

// ─── Saved Search Card ──────────────────────────────────────────────────────────

function SavedSearchCard({
  search,
  onDelete,
  onToggleAlert,
  onRun,
}: {
  search: SavedSearch;
  onDelete: (id: string) => void;
  onToggleAlert: (id: string) => void;
  onRun: (search: SavedSearch) => void;
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { filters } = search;

  const createdDate = new Date(search.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4 mobile:flex-col">
        {/* Search Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {search.name}
          </h3>

          {/* Filter tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {filters.keyword && (
              <FilterBadge
                icon={<HiOutlineMagnifyingGlass className="w-3 h-3" />}
                label={filters.keyword}
              />
            )}
            {filters.location && (
              <FilterBadge
                icon={<HiOutlineMapPin className="w-3 h-3" />}
                label={filters.location}
              />
            )}
            {filters.jobType && (
              <FilterBadge
                icon={<HiOutlineBriefcase className="w-3 h-3" />}
                label={filters.jobType}
              />
            )}
            {filters.experienceLevel && (
              <FilterBadge
                icon={<HiOutlineAcademicCap className="w-3 h-3" />}
                label={`${filters.experienceLevel} level`}
              />
            )}
            {!filters.keyword &&
              !filters.location &&
              !filters.jobType &&
              !filters.experienceLevel && (
                <FilterBadge
                  icon={<HiOutlineFunnel className="w-3 h-3" />}
                  label="All jobs"
                />
              )}
          </div>

          {/* Alert status */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <HiOutlineCalendarDays className="text-sm" />
              Saved on {createdDate}
            </span>
            {search.alertEnabled && (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <HiOutlineBellAlert className="text-sm" />
                Alerts on
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0 mobile:flex-row mobile:w-full mobile:flex-wrap">
          <button
            onClick={() => onRun(search)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
          >
            <HiOutlineArrowTopRightOnSquare className="text-sm" />
            Run Search
          </button>
          <button
            onClick={() => onToggleAlert(search.id)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
              search.alertEnabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {search.alertEnabled ? (
              <>
                <HiOutlineBellSlash className="text-sm" />
                Alerts On
              </>
            ) : (
              <>
                <HiOutlineBellAlert className="text-sm" />
                Enable Alerts
              </>
            )}
          </button>
          {showConfirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDelete(search.id)}
                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <HiOutlineTrash className="text-sm" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function SavedSearchesPage() {
  const router = useRouter();
  const { searches, isLoaded, removeSearch, toggleAlert, updateLastRun } =
    useSavedSearches();

  const handleRun = (search: SavedSearch) => {
    updateLastRun(search.id);
    router.push(buildSearchUrl(search.filters));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[800px] mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-40 bg-gray-200 rounded-xl" />
            <div className="h-40 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-2">
          <h1 className="font-lato text-[28px] font-bold text-gray-900">
            Saved Searches
          </h1>
          {searches.length > 0 && (
            <span className="text-sm text-gray-400 mt-2">
              {searches.length} search{searches.length !== 1 && "es"} saved
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Quickly re-run your favorite searches or enable alerts to get notified
          about new matching jobs.
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8" />

        {/* Content */}
        {searches.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-4">
              {searches.map((search) => (
                <SavedSearchCard
                  key={search.id}
                  search={search}
                  onDelete={removeSearch}
                  onToggleAlert={toggleAlert}
                  onRun={handleRun}
                />
              ))}
            </div>

            {/* Info banner */}
            <div className="mt-8 bg-red-50 border border-red-100 rounded-xl p-5">
              <div className="flex gap-3">
                <HiOutlineBellAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">
                    About Job Alerts
                  </p>
                  <p className="text-sm text-red-600 leading-relaxed">
                    When you enable alerts, we&apos;ll save your preference.
                    Email notifications for new matching jobs are coming soon —
                    for now, you can quickly re-run your searches from this
                    page.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

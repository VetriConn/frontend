"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  runSavedSearch as runSavedSearchApi,
  type SavedSearchResponse,
} from "@/lib/api/job-search";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface SavedSearchFilters {
  keyword?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  arrangement?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  alertEnabled: boolean;
  createdAt: string;
  lastRunAt?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Map backend response (snake_case) to frontend shape (camelCase).
 */
function mapFromBackend(raw: SavedSearchResponse): SavedSearch {
  return {
    id: raw._id,
    name: raw.name,
    filters: {
      keyword: raw.filters.keyword || undefined,
      location: raw.filters.location || undefined,
      jobType: raw.filters.job_type || undefined,
      experienceLevel: raw.filters.experience_level || undefined,
      arrangement: raw.filters.work_arrangement || undefined,
    },
    alertEnabled: raw.alert_enabled,
    createdAt: raw.createdAt,
    lastRunAt: raw.last_run_at || undefined,
  };
}

/**
 * Build a human-readable name from search filters.
 */
export function buildSearchName(filters: SavedSearchFilters): string {
  const parts: string[] = [];

  if (filters.keyword) parts.push(`"${filters.keyword}"`);
  if (filters.location) parts.push(`in ${filters.location}`);
  if (filters.jobType) parts.push(filters.jobType);
  if (filters.experienceLevel) parts.push(`${filters.experienceLevel} level`);
  if (filters.arrangement) parts.push(filters.arrangement);

  return parts.length > 0 ? parts.join(" · ") : "All Jobs";
}

/**
 * Build URL search params from saved search filters.
 */
export function buildSearchUrl(filters: SavedSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.keyword) params.set("q", filters.keyword);
  if (filters.location) params.set("location", filters.location);
  if (filters.jobType) params.set("type", filters.jobType);
  if (filters.experienceLevel)
    params.set("experience", filters.experienceLevel);
  if (filters.arrangement) params.set("arrangement", filters.arrangement);
  const qs = params.toString();
  return qs ? `/dashboard/find-jobs?${qs}` : "/dashboard/find-jobs";
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch from backend on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const raw = await getSavedSearches();
        if (!cancelled) {
          setSearches(raw.map(mapFromBackend));
        }
      } catch (err) {
        console.error("Failed to load saved searches:", err);
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addSearch = useCallback(
    async (filters: SavedSearchFilters, customName?: string) => {
      const name = customName || buildSearchName(filters);
      try {
        const raw = await createSavedSearch(name, filters);
        const mapped = mapFromBackend(raw);
        setSearches((prev) => [mapped, ...prev]);
        return mapped;
      } catch (err) {
        console.error("Failed to create saved search:", err);
        throw err;
      }
    },
    [],
  );

  const removeSearch = useCallback(async (id: string) => {
    // Optimistic removal
    setSearches((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSavedSearch(id);
    } catch (err) {
      console.error("Failed to delete saved search:", err);
      // Re-fetch on failure to restore correct state
      const raw = await getSavedSearches();
      setSearches(raw.map(mapFromBackend));
    }
  }, []);

  const toggleAlert = useCallback(async (id: string) => {
    // Optimistic toggle
    setSearches((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, alertEnabled: !s.alertEnabled } : s,
      ),
    );
    try {
      // Read current state after optimistic update
      const current = searches.find((s) => s.id === id);
      await updateSavedSearch(id, { alertEnabled: !(current?.alertEnabled ?? false) });
    } catch (err) {
      console.error("Failed to toggle alert:", err);
      const raw = await getSavedSearches();
      setSearches(raw.map(mapFromBackend));
    }
  }, [searches]);

  const updateLastRun = useCallback(async (id: string) => {
    // Optimistic update
    setSearches((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, lastRunAt: new Date().toISOString() } : s,
      ),
    );
    try {
      await runSavedSearchApi(id);
    } catch (err) {
      console.error("Failed to record search run:", err);
    }
  }, []);

  const renameSearch = useCallback(async (id: string, newName: string) => {
    // Optimistic update
    setSearches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s)),
    );
    try {
      await updateSavedSearch(id, { name: newName });
    } catch (err) {
      console.error("Failed to rename search:", err);
      const raw = await getSavedSearches();
      setSearches(raw.map(mapFromBackend));
    }
  }, []);

  const hasSearch = useCallback(
    (filters: SavedSearchFilters): boolean => {
      return searches.some(
        (s) =>
          (s.filters.keyword || "") === (filters.keyword || "") &&
          (s.filters.location || "") === (filters.location || "") &&
          (s.filters.jobType || "") === (filters.jobType || "") &&
          (s.filters.experienceLevel || "") === (filters.experienceLevel || ""),
      );
    },
    [searches],
  );

  return {
    searches,
    isLoaded,
    addSearch,
    removeSearch,
    toggleAlert,
    updateLastRun,
    renameSearch,
    hasSearch,
  };
}

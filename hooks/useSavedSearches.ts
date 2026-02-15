"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface SavedSearchFilters {
  keyword?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  alertEnabled: boolean;
  createdAt: string;
  lastRunAt?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "vetriconn_saved_searches";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function generateId(): string {
  return `ss_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadFromStorage(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(searches: SavedSearch[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch (e) {
    console.error("Failed to save searches to localStorage:", e);
  }
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
  const qs = params.toString();
  return qs ? `/dashboard/jobs?${qs}` : "/dashboard/jobs";
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setSearches(loadFromStorage());
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever searches change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(searches);
    }
  }, [searches, isLoaded]);

  const addSearch = useCallback(
    (filters: SavedSearchFilters, customName?: string) => {
      const name = customName || buildSearchName(filters);
      const newSearch: SavedSearch = {
        id: generateId(),
        name,
        filters,
        alertEnabled: false,
        createdAt: new Date().toISOString(),
      };
      setSearches((prev) => [newSearch, ...prev]);
      return newSearch;
    },
    [],
  );

  const removeSearch = useCallback((id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setSearches((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, alertEnabled: !s.alertEnabled } : s,
      ),
    );
  }, []);

  const updateLastRun = useCallback((id: string) => {
    setSearches((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, lastRunAt: new Date().toISOString() } : s,
      ),
    );
  }, []);

  const renameSearch = useCallback((id: string, newName: string) => {
    setSearches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s)),
    );
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

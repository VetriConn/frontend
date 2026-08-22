"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTrackerEntries,
  createTrackerEntry,
  updateTrackerEntry,
  deleteTrackerEntry,
  type TrackerEntryResponse,
} from "@/lib/api/job-search";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "viewed"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type ApplicationSource = "vetriconn" | "external";

export interface ApplicationEntry {
  id: string;
  job_id?: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  source: ApplicationSource;
  applied_date: string;
  notes?: string;
  url?: string;
  location?: string;
  updated_at: string;
}

// ─── Status Config ──────────────────────────────────────────────────────────────

export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    icon: string;
  }
> = {
  saved: {
    label: "Saved",
    textColor: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: "📌",
  },
  applied: {
    label: "Applied",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: "📤",
  },
  viewed: {
    label: "Viewed",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: "👁️",
  },
  interview: {
    label: "Interview",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: "🎯",
  },
  offer: {
    label: "Offer",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: "🎉",
  },
  rejected: {
    label: "Not Selected",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: "✕",
  },
  withdrawn: {
    label: "Withdrawn",
    textColor: "text-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: "↩",
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Map backend response (snake_case) to frontend shape (camelCase).
 */
function mapFromBackend(raw: TrackerEntryResponse): ApplicationEntry {
  return {
    id: raw._id,
    job_id: raw.job_id || undefined,
    company: raw.company_name,
    position: raw.job_title,
    status: raw.status,
    source: raw.source,
    applied_date: raw.applied_at || raw.createdAt,
    notes: raw.notes || undefined,
    location: raw.location || undefined,
    updated_at: raw.updatedAt,
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useApplications() {
  const [applications, setApplications] = useState<ApplicationEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch from backend on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { entries } = await getTrackerEntries({ limit: 200 });
        if (!cancelled) {
          setApplications(entries.map(mapFromBackend));
        }
      } catch (err) {
        console.error("Failed to load tracker entries:", err);
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

  const addApplication = useCallback(
    async (entry: Omit<ApplicationEntry, "id" | "updated_at">) => {
      try {
        const raw = await createTrackerEntry({
          job_title: entry.position,
          company_name: entry.company,
          location: entry.location,
          status: entry.status,
          notes: entry.notes,
          applied_at: entry.applied_date,
        });
        const mapped = mapFromBackend(raw);
        setApplications((prev) => [mapped, ...prev]);
        return mapped;
      } catch (err) {
        console.error("Failed to create tracker entry:", err);
        throw err;
      }
    },
    [],
  );

  const updateStatus = useCallback(
    async (id: string, status: ApplicationStatus) => {
      // Optimistic update
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? { ...app, status, updated_at: new Date().toISOString() }
            : app,
        ),
      );
      try {
        await updateTrackerEntry(id, { status });
      } catch (err) {
        console.error("Failed to update tracker status:", err);
        // Re-fetch on failure
        const { entries } = await getTrackerEntries({ limit: 200 });
        setApplications(entries.map(mapFromBackend));
      }
    },
    [],
  );

  const updateNotes = useCallback(
    async (id: string, notes: string) => {
      // Optimistic update
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? { ...app, notes, updated_at: new Date().toISOString() }
            : app,
        ),
      );
      try {
        await updateTrackerEntry(id, { notes });
      } catch (err) {
        console.error("Failed to update tracker notes:", err);
        const { entries } = await getTrackerEntries({ limit: 200 });
        setApplications(entries.map(mapFromBackend));
      }
    },
    [],
  );

  const removeApplication = useCallback(async (id: string) => {
    // Optimistic removal
    setApplications((prev) => prev.filter((app) => app.id !== id));
    try {
      await deleteTrackerEntry(id);
    } catch (err) {
      console.error("Failed to delete tracker entry:", err);
      const { entries } = await getTrackerEntries({ limit: 200 });
      setApplications(entries.map(mapFromBackend));
    }
  }, []);

  const getByJobId = useCallback(
    (jobId: string): ApplicationEntry | undefined => {
      return applications.find((app) => app.job_id === jobId);
    },
    [applications],
  );

  // Stats
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    interview: applications.filter((a) => a.status === "interview").length,
    offer: applications.filter((a) => a.status === "offer").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    active: applications.filter((a) =>
      ["applied", "viewed", "interview"].includes(a.status),
    ).length,
  };

  return {
    applications,
    isLoaded,
    stats,
    addApplication,
    updateStatus,
    updateNotes,
    removeApplication,
    getByJobId,
  };
}

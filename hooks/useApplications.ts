"use client";

import { useState, useEffect, useCallback } from "react";

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

// ─── Constants ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "vetriconn_applications";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function generateId(): string {
  return `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadFromStorage(): ApplicationEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(applications: ApplicationEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch (e) {
    console.error("Failed to save applications to localStorage:", e);
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useApplications() {
  const [applications, setApplications] = useState<ApplicationEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setApplications(loadFromStorage());
    setIsLoaded(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(applications);
    }
  }, [applications, isLoaded]);

  const addApplication = useCallback(
    (entry: Omit<ApplicationEntry, "id" | "updated_at">) => {
      const newEntry: ApplicationEntry = {
        ...entry,
        id: generateId(),
        updated_at: new Date().toISOString(),
      };
      setApplications((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    [],
  );

  const updateStatus = useCallback((id: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, status, updated_at: new Date().toISOString() }
          : app,
      ),
    );
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, notes, updated_at: new Date().toISOString() }
          : app,
      ),
    );
  }, []);

  const removeApplication = useCallback((id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
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

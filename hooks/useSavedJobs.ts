"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { getSavedJobs, saveJob, unsaveJob } from "@/lib/api";

export function useSavedJobs() {
  const {
    data: savedJobs = [],
    isLoading,
    mutate,
  } = useSWR("/auth/saved-jobs", getSavedJobs);

  const [pendingSavedIds, setPendingSavedIds] = useState<Set<string>>(
    new Set(),
  );
  const [pendingUnsavedIds, setPendingUnsavedIds] = useState<Set<string>>(
    new Set(),
  );

  const baseSavedIds = useMemo(() => {
    return new Set(savedJobs.map((job) => job.id || job._id));
  }, [savedJobs]);

  const isSaved = (jobId: string) => {
    if (pendingSavedIds.has(jobId)) return true;
    if (pendingUnsavedIds.has(jobId)) return false;
    return baseSavedIds.has(jobId);
  };

  const toggleSaved = async (jobId: string) => {
    if (isSaved(jobId)) {
      setPendingUnsavedIds((prev) => new Set(prev).add(jobId));
      try {
        await unsaveJob(jobId);
        await mutate(
          (current) =>
            (current || []).filter((job) => {
              const id = job.id || job._id;
              return id !== jobId;
            }),
          { revalidate: false },
        );
      } finally {
        setPendingUnsavedIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      }
      return;
    }

    setPendingSavedIds((prev) => new Set(prev).add(jobId));
    try {
      await saveJob(jobId);
      await mutate();
    } finally {
      setPendingSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  const removeSavedJob = async (jobId: string) => {
    setPendingUnsavedIds((prev) => new Set(prev).add(jobId));
    const previous = savedJobs;

    await mutate(
      (current) =>
        (current || []).filter((job) => {
          const id = job.id || job._id;
          return id !== jobId;
        }),
      { revalidate: false },
    );

    try {
      await unsaveJob(jobId);
    } catch (error) {
      await mutate(previous, { revalidate: false });
      throw error;
    } finally {
      setPendingUnsavedIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  return {
    savedJobs,
    isLoading,
    mutate,
    isSaved,
    isMutating: (jobId: string) =>
      pendingSavedIds.has(jobId) || pendingUnsavedIds.has(jobId),
    toggleSaved,
    removeSavedJob,
  };
}

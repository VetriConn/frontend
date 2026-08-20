"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { getSavedJobs, saveJob, unsaveJob } from "@/lib/api";
import type { JobsResponse } from "@/types/api";

/**
 * A job answers to two identities: the slug (`id`, e.g. head-baker-91994a34)
 * and the Mongo `_id`. Which one a surface holds depends on where it got the
 * job — the browse card links by slug, the detail page is often reached by
 * _id — and `saved_jobs` stores only the canonical slug.
 *
 * This hook used to index saved jobs by `id || _id`, so a page holding the
 * _id asked "is this saved?" against a set of slugs and was told no. The Save
 * button then offered to save a job that was already saved, and the request
 * came back "Job already saved" while the button never changed. Indexing both
 * forms mirrors the backend, whose jobIdentityQuery accepts either.
 */
const identitiesOf = (job: JobsResponse): string[] =>
  [job.id, job._id].filter((value): value is string => Boolean(value));

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

  const baseSavedIds = useMemo(
    () => new Set(savedJobs.flatMap(identitiesOf)),
    [savedJobs],
  );

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
            (current || []).filter((job) => !identitiesOf(job).includes(jobId)),
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
        (current || []).filter((job) => !identitiesOf(job).includes(jobId)),
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

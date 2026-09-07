import useSWR from "swr";
import { getJobById } from "@/lib/api";
import { Job } from "@/types/job";
import { mapJobsResponse } from "@/lib/job-mapper";
import type { JobsResponse } from "@/types/api";

export function useJob(jobId: string, initialData?: JobsResponse | null) {
  // Seeded from the server render when available: the visitor paints from
  // the ISR copy instantly, and one background request revalidates it. That
  // request is deliberate — the ISR page can be up to revalidate:300 stale,
  // and it is what pulls a just-rejected or just-unpublished listing within
  // seconds instead of minutes. revalidateOnMount is explicit because SWR
  // does NOT revalidate on mount by default when fallbackData is set.
  const { data, error, mutate, isLoading } = useSWR(
    jobId ? `/jobs/${jobId}` : null,
    () => getJobById(jobId),
    initialData
      ? { fallbackData: initialData, revalidateOnMount: true }
      : undefined,
  );

  const job: Job | null = data ? mapJobsResponse(data) : null;

  return {
    job,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

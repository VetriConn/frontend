import useSWR from "swr";
import { getJobById } from "@/lib/api";
import { Job } from "@/types/job";
import { mapJobsResponse } from "@/lib/job-mapper";
import type { JobsResponse } from "@/types/api";

export function useJob(jobId: string, initialData?: JobsResponse | null) {
  // Seeded from the server render when available: without fallbackData every
  // job view refetched data already on screen, tripling backend reads per
  // view (SSR + metadata + client revalidate).
  const { data, error, mutate, isLoading } = useSWR(
    jobId ? `/jobs/${jobId}` : null,
    () => getJobById(jobId),
    initialData
      ? { fallbackData: initialData, revalidateOnMount: false }
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

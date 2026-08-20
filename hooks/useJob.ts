import useSWR from "swr";
import { getJobById } from "@/lib/api";
import { Job } from "@/types/job";
import { mapJobsResponse } from "@/lib/job-mapper";

export function useJob(jobId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    jobId ? `/jobs/${jobId}` : null,
    () => getJobById(jobId),
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

import useSWR from "swr";
import { getJobById } from "@/lib/api";
import { Job } from "@/types/job";
import { mapTagColor } from "@/lib/job-tag-colors";

export function useJob(jobId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    jobId ? `/jobs/${jobId}` : null,
    () => getJobById(jobId),
  );

  // Transform backend job data to frontend format
  const job: Job | null = data
    ? {
        id: data._id || data.id,
        role: data.role,
        company_name: data.company_name,
        company_logo: data.company_logo || "",
        location: data.location || "",
        salary: data.salary,
        salary_range: data.salary_range,
        tags: data.tags
          ? data.tags.map((tag) => ({
              name: tag,
              color: mapTagColor(tag),
            }))
          : [],
        full_description: data.full_description || data.description || "",
        responsibilities: data.responsibilities || [],
        qualifications: data.qualifications || [],
        applicationLink: data.applicationLink,
      }
    : null;

  return {
    job,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

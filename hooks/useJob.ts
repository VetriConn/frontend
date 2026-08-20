import useSWR from "swr";
import { getJobById } from "@/lib/api";
import { Job } from "@/types/job";

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
          ? data.tags.map((tag) => ({ name: tag }))
          : [],
        full_description: data.full_description || data.description || "",
        responsibilities: data.responsibilities || [],
        qualifications: data.qualifications || [],
        applicationLink: data.applicationLink,
        source: data.source,
        source_name: data.source_name,
        external_url: data.external_url,
        salary_text: data.salary_text,
        posted_as: data.posted_as,
        company_id: data.company_id,
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

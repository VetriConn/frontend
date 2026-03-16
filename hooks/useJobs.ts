import useSWR from "swr";
import { getJobs } from "@/lib/api";
import { Job } from "@/types/job";
import { mapTagColor } from "@/lib/job-tag-colors";

interface UseJobsOptions {
  page?: number;
  limit?: number;
  location?: string;
  search?: string;
}

export function useJobs(options?: UseJobsOptions) {
  const { page = 1, limit = 10, location, search } = options || {};

  // Create a cache key from the options
  const cacheKey = `/jobs?page=${page}&limit=${limit}${
    location ? `&location=${location}` : ""
  }${search ? `&search=${search}` : ""}`;

  const { data, error, mutate, isLoading } = useSWR(cacheKey, () =>
    getJobs(options),
  );

  // Transform backend job data to frontend format
  const jobs: Job[] =
    data && Array.isArray(data)
      ? data.map((job) => ({
          id: job._id || job.id,
          role: job.role,
          company_name: job.company_name,
          company_logo: job.company_logo || "",
          location: job.location || "",
          salary: job.salary,
          salary_range: job.salary_range,
          tags: job.tags
            ? job.tags.map((tag) => ({
                name: tag,
                color: mapTagColor(tag),
              }))
            : [],
          full_description: job.full_description || job.description || "",
          responsibilities: job.responsibilities || [],
          qualifications: job.qualifications || [],
          applicationLink: job.applicationLink,
        }))
      : [];

  return {
    jobs,
    isLoading,
    isError: !!error,
    error,
    mutate,
    total: jobs.length,
    page: page,
    limit: limit,
  };
}

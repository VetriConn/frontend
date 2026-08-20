import useSWR from "swr";
import { getJobs } from "@/lib/api";
import { Job } from "@/types/job";

interface UseJobsOptions {
  page?: number;
  limit?: number;
  location?: string;
  search?: string;
  /** Both narrow in the database; they used to be applied in the browser. */
  jobType?: string;
  experience?: string;
}

export function useJobs(options?: UseJobsOptions) {
  const { page = 1, limit = 10, location, search, jobType, experience } =
    options || {};

  // Every input that changes the response belongs in the key, or a filter
  // change would serve the previous filter's page from cache.
  const cacheKey = `/jobs?page=${page}&limit=${limit}${
    location ? `&location=${location}` : ""
  }${search ? `&search=${search}` : ""}${jobType ? `&jobType=${jobType}` : ""}${
    experience ? `&experience=${experience}` : ""
  }`;

  const { data, error, mutate, isLoading } = useSWR(cacheKey, () =>
    getJobs(options),
  );

  // Transform backend job data to frontend format
  const jobs: Job[] =
    data?.jobs?.map((job) => ({
          id: job._id || job.id,
          role: job.role,
          company_name: job.company_name,
          company_logo: job.company_logo || "",
          location: job.location || "",
          salary: job.salary,
          salary_range: job.salary_range,
          tags: job.tags
            ? job.tags.map((tag) => ({ name: tag }))
            : [],
          full_description: job.full_description || job.description || "",
          responsibilities: job.responsibilities || [],
          qualifications: job.qualifications || [],
          applicationLink: job.applicationLink,
          source: job.source,
          source_name: job.source_name,
          external_url: job.external_url,
          salary_text: job.salary_text,
          posted_as: job.posted_as,
          company_id: job.company_id,
    })) ?? [];

  const pagination = data?.pagination;

  return {
    jobs,
    isLoading,
    isError: !!error,
    error,
    mutate,
    // The real total from the server. This used to report jobs.length — the
    // size of the page in hand — so "Showing N jobs" counted the wrong thing
    // and page controls had nothing to count against.
    total: pagination?.totalItems ?? jobs.length,
    totalPages: pagination?.totalPages ?? 1,
    /** More results are being fetched from source for this search. */
    searchingMore: data?.searchingMore === true,
    page: pagination?.currentPage ?? page,
    limit,
  };
}

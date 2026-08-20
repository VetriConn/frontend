import useSWR from "swr";
import { getJobs } from "@/lib/api";
import { Job } from "@/types/job";
import { mapJobsResponse } from "@/lib/job-mapper";

interface UseJobsOptions {
  page?: number;
  limit?: number;
  location?: string;
  search?: string;
  /** All three narrow in the database; they used to be applied in the browser. */
  jobType?: string;
  experience?: string;
  arrangement?: string;
}

export function useJobs(options?: UseJobsOptions) {
  const {
    page = 1,
    limit = 10,
    location,
    search,
    jobType,
    experience,
    arrangement,
  } = options || {};

  // Every input that changes the response belongs in the key, or a filter
  // change would serve the previous filter's page from cache.
  const cacheKey = `/jobs?page=${page}&limit=${limit}${
    location ? `&location=${location}` : ""
  }${search ? `&search=${search}` : ""}${jobType ? `&jobType=${jobType}` : ""}${
    experience ? `&experience=${experience}` : ""
  }${arrangement ? `&arrangement=${arrangement}` : ""}`;

  const { data, error, mutate, isLoading } = useSWR(cacheKey, () =>
    getJobs(options),
  );

  const jobs: Job[] = data?.jobs?.map(mapJobsResponse) ?? [];

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

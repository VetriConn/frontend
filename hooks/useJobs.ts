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

  const { data, error, mutate, isLoading, isValidating } = useSWR(
    cacheKey,
    () => getJobs(options),
    {
      // A job board doesn't change second to second. SWR's default is to
      // refetch every time the window regains focus, which on this page reads
      // as the list "refreshing in the background" — and repaints it — each
      // time you tab back. Revalidate on an explicit navigation/filter change
      // instead, and keep the previous page visible while the next one loads
      // so paging never flashes an empty list.
      revalidateOnFocus: false,
      keepPreviousData: true,
      // Normal browsing can dedupe; while a search top-up is in flight we
      // need each poll to actually hit the API or the new listings never
      // appear without a manual reload.
      dedupingInterval: 5_000,
      // When the board is thin and the server is scraping for this query,
      // keep asking until searching_more clears and the saved listings show.
      refreshInterval: (latest) => (latest?.searchingMore ? 4_000 : 0),
    },
  );

  const jobs: Job[] = data?.jobs?.map(mapJobsResponse) ?? [];

  const pagination = data?.pagination;

  return {
    jobs,
    isLoading,
    /**
     * A fetch is in flight over rows we are still showing.
     *
     * keepPreviousData keeps the old rows on screen while the next request
     * runs, which is right — but nothing then told the reader anything was
     * happening. Clicking Next scrolled them to the top of the page they had
     * just left and left them there for the round trip.
     *
     * The test is the ROWS, not `!isLoading`. SWR reports `isLoading: true`
     * whenever the current key has no data of its own, and a new search is a
     * new key — so `isValidating && !isLoading` was false for the entire
     * length of every search, which is precisely the case it was meant to
     * cover. The list sat undimmed showing the previous query's rows and the
     * previous query's count, as though the search had already come back and
     * changed nothing.
     *
     * Having rows is the honest condition: rows on screen plus a request in
     * flight means what is being shown is not the answer yet. With no rows
     * there is nothing to caveat, and the skeletons take over instead.
     */
    isRefreshing: isValidating && jobs.length > 0,
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

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { SearchBar } from "@/components/ui/SearchBar";
import { JobResultsList } from "@/components/ui/JobResultsList";
import { useJobs } from "@/hooks/useJobs";
import { getJobs } from "@/lib/api";
import type { Job } from "@/types/job";

/**
 * Pressing Search used to produce nothing you could see.
 *
 * The button was unchanged, the count above the results still read the
 * PREVIOUS query's total, and the only signal was a 50% dim that never fired
 * — see the isRefreshing case below. On a board whose readers skew 45+ that
 * is indistinguishable from a dead click, and the second press is what a
 * person does next.
 */

jest.mock("@/lib/api", () => ({
  getJobs: jest.fn(),
}));

// JobResultCard reaches for the router and the local draft store; neither is
// what these assert, and neither exists under jsdom.
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("@/lib/applicationDrafts", () => ({
  hasApplicationDraft: jest.fn(async () => false),
}));

jest.mock("@/hooks/useUserProfile", () => ({
  useUserProfile: () => ({ userProfile: { id: "u1" } }),
}));

const mockGetJobs = getJobs as jest.MockedFunction<typeof getJobs>;

const JOB = {
  id: "j1",
  role: "Security Guard",
  company_name: "Northline",
  location: "Burnaby",
  // The card renders job.summary, not job.description.
  summary: "Overnight site patrols at the Burnaby yard.",
} as unknown as Job;

const page = (total: number) => ({
  jobs: [{ id: "j1", role: "Security Guard", company_name: "Northline" }],
  pagination: { currentPage: 1, totalPages: 1, totalItems: total },
});

describe("search feedback", () => {
  describe("the Search button", () => {
    it("answers the click it received", async () => {
      const { rerender } = render(
        <SearchBar value="Security" onChange={() => {}} onSearch={() => {}} />,
      );
      expect(screen.getByRole("button", { name: "Search" })).toBeEnabled();

      rerender(
        <SearchBar
          value="Security"
          onChange={() => {}}
          onSearch={() => {}}
          isSearching
        />,
      );
      const busy = screen.getByRole("button", { name: /searching/i });
      expect(busy).toBeDisabled();
      expect(busy).toHaveAttribute("aria-busy", "true");
    });

    it("ignores Enter while the last search is still out", async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      render(
        <SearchBar
          value="Security"
          onChange={() => {}}
          onSearch={onSearch}
          isSearching
        />,
      );

      await user.type(screen.getByRole("searchbox"), "{Enter}");
      // The button is disabled, so Enter had to be stopped too — otherwise the
      // keyboard route queues a second request the mouse route refuses.
      expect(onSearch).not.toHaveBeenCalled();
    });

    it("keeps focus out of the error vocabulary", () => {
      render(
        <SearchBar value="" onChange={() => {}} onSearch={() => {}} />,
      );
      const bar = screen.getByRole("search");
      const input = screen.getByRole("searchbox");

      // fieldStyles.ts settled that focus is never red in this product,
      // because red is how a rejected value is marked. jsdom can't resolve
      // Tailwind's cascade, so this asserts the intent directly: the bar wears
      // the focus treatment, and the input opts out of the global red
      // :focus-visible outline via a higher-specificity class in globals.css.
      expect(bar.className).toContain("focus-within:border-gray-500");
      expect(bar.className).toContain("focus-within:ring-2");
      expect(bar.className).not.toContain("outline-primary");
      expect(input.className).toContain("search-bar-input");
    });
  });

  describe("the results count", () => {
    it("does not offer the last query's total as this one's answer", () => {
      const { rerender } = render(
        <JobResultsList
          jobs={[JOB]}
          totalCount={26}
          isLoading={false}
          isError={false}
        />,
      );
      expect(screen.getByText("26 jobs found")).toBeInTheDocument();

      rerender(
        <JobResultsList
          jobs={[JOB]}
          totalCount={26}
          isLoading={false}
          isRefreshing
          isError={false}
        />,
      );
      // The number belongs to the query before this one, and it sits in an
      // aria-live region — so left in place it is read out as the result of
      // the search just run.
      expect(screen.queryByText("26 jobs found")).not.toBeInTheDocument();
    });
  });

  describe("useJobs.isRefreshing", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        {children}
      </SWRConfig>
    );

    it("is true while a new query runs over the old rows", async () => {
      mockGetJobs.mockReset();
      mockGetJobs.mockResolvedValueOnce(page(26) as never);

      const { result, rerender } = renderHook(
        ({ search }) => useJobs({ search }),
        { wrapper, initialProps: { search: "security" } },
      );

      await waitFor(() => expect(result.current.jobs).toHaveLength(1));
      expect(result.current.isRefreshing).toBe(false);

      // The next query never comes back, so the hook stays in the state the
      // screen has to describe.
      let release: (v: unknown) => void = () => {};
      mockGetJobs.mockReturnValueOnce(
        new Promise((r) => {
          release = r;
        }) as never,
      );

      rerender({ search: "warehouse" });

      await waitFor(() => expect(result.current.isRefreshing).toBe(true));
      // keepPreviousData: the old rows are still on screen, which is exactly
      // why they need to be marked as not-the-answer-yet. The previous test
      // for this was `isValidating && !isLoading`, and SWR reports isLoading
      // for a key with no data of its own — so it was false for the whole of
      // every search, the one case it existed for.
      expect(result.current.jobs).toHaveLength(1);

      await act(async () => {
        release(page(3));
      });
      await waitFor(() => expect(result.current.isRefreshing).toBe(false));
    });

    it("stays false on a cold start, where skeletons speak instead", async () => {
      mockGetJobs.mockReset();
      let release: (v: unknown) => void = () => {};
      mockGetJobs.mockReturnValueOnce(
        new Promise((r) => {
          release = r;
        }) as never,
      );

      const { result } = renderHook(() => useJobs({ search: "welder" }), {
        wrapper,
      });

      // No rows yet, so there is nothing to caveat — dimming an empty column
      // and captioning it would be noise on top of the skeletons.
      expect(result.current.jobs).toHaveLength(0);
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        release(page(1));
      });
      await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    });

    it("surfaces searchingMore so the page can keep polling the top-up", async () => {
      mockGetJobs.mockReset();
      mockGetJobs.mockResolvedValueOnce({
        ...page(1),
        searchingMore: true,
      } as never);

      const { result } = renderHook(() => useJobs({ search: "mobile" }), {
        wrapper,
      });

      await waitFor(() => expect(result.current.searchingMore).toBe(true));
      expect(result.current.jobs).toHaveLength(1);
    });
  });
});

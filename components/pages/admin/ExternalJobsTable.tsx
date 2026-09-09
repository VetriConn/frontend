"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  HiOutlineGlobeAlt,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import {
  adminListExternalJobs,
  adminDeleteExternalJob,
  type ExternalJob,
} from "@/lib/api/jobs";
import { useToaster } from "@/components/ui/Toaster";
import {
  AdminTablePanel,
  AdminTable,
  AdminTableHead,
  AdminTableTh,
  AdminTableBody,
  AdminTableRow,
  AdminTableTd,
  AdminRowSkeleton,
  AdminEmptyState,
  StatusPill,
  AdminPagination,
  AdminLoadError,
} from "./AdminTablePanel";
import ConfirmDialog from "./ConfirmDialog";
import { formatDate } from "@/lib/date-utils";
import { formatJobSalary } from "@/lib/job-display";

/**
 * The scraped board, which nothing else in the console shows.
 *
 * The review queue is scoped to postings awaiting a decision, and scraped
 * listings arrive already approved from a trusted source — so they were
 * invisible everywhere: no count, no way to see what was on the board, and no
 * way to remove a bad one. The duplicate listings that prompted this were
 * only noticeable from the public job list.
 *
 * The available actions are deliberately narrow. These rows are not ours to
 * edit — the source owns the content and the next run overwrites it — so
 * opening the original and deleting a listing are the only two things here
 * that mean anything.
 */
const PAGE_SIZE = 20;

const ExternalJobsTable = () => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<ExternalJob | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const { showToast } = useToaster();

  const { data, error, isLoading, mutate } = useSWR(
    ["admin-external-jobs", page, query],
    () => adminListExternalJobs(page, PAGE_SIZE, query),
  );

  const jobs = data?.jobs ?? [];
  const isError = !!error;

  const handleDelete = async () => {
    if (!deleting) return;
    setDialogBusy(true);
    try {
      await adminDeleteExternalJob(deleting._id);
      showToast({
        type: "success",
        title: "Listing removed",
        description: `"${deleting.role}" is off the board.`,
      });
      setDeleting(null);
      await mutate();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't remove listing",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDialogBusy(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 max-w-xl">
          Listings pulled from external sources. The scraper refreshes these on
          its own, so anything deleted here comes back if the source still
          lists it.
        </p>
        <div className="relative shrink-0 sm:w-72">
          <HiOutlineMagnifyingGlass
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <label htmlFor="external-search" className="sr-only">
            Search external jobs by role, company or location
          </label>
          <input
            id="external-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search role, company or location"
            className="block min-h-[44px] w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>Role</AdminTableTh>
            <AdminTableTh>Company</AdminTableTh>
            <AdminTableTh>Location</AdminTableTh>
            <AdminTableTh>Pay</AdminTableTh>
            <AdminTableTh>Last seen</AdminTableTh>
            <AdminTableTh align="right">Actions</AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <AdminRowSkeleton key={i} columns={6} />
                ))
              : jobs.map((job) => (
                  <AdminTableRow key={job._id}>
                    <AdminTableTd className="font-semibold text-gray-900">
                      {job.role}
                    </AdminTableTd>
                    <AdminTableTd>{job.company_name || "—"}</AdminTableTd>
                    <AdminTableTd>{job.location || "—"}</AdminTableTd>
                    <AdminTableTd>
                      {formatJobSalary(
                        { compensation: job.compensation },
                        "full",
                      ) ?? "—"}
                    </AdminTableTd>
                    <AdminTableTd>
                      {job.last_scraped_at ? (
                        formatDate(job.last_scraped_at)
                      ) : (
                        // Never re-seen by a run since it was inserted. These
                        // are what the stale sweep ages out, and the ones
                        // worth a second look before deleting anything else.
                        <StatusPill tone="amber">Not refreshed</StatusPill>
                      )}
                    </AdminTableTd>
                    <AdminTableTd align="right">
                      <div className="flex items-center justify-end gap-1">
                        {job.external_url && (
                          <a
                            href={job.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary"
                          >
                            <HiOutlineArrowTopRightOnSquare className="h-5 w-5" />
                            <span className="sr-only">
                              Open &ldquo;{job.role}&rdquo; at the source
                            </span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleting(job)}
                          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-700"
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                          <span className="sr-only">
                            Delete &ldquo;{job.role}&rdquo;
                          </span>
                        </button>
                      </div>
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>

        {!isLoading && isError && (
          <AdminLoadError what="external jobs" onRetry={() => mutate()} />
        )}
        {!isLoading && !isError && jobs.length === 0 && (
          <AdminEmptyState
            title={query ? "No matches" : "No external jobs"}
            description={
              query
                ? "Nothing on the external board matches that search."
                : "Run the scraper to pull listings from external sources."
            }
            icon={HiOutlineGlobeAlt}
          />
        )}

        <AdminPagination pagination={data?.pagination} onPage={setPage} />
      </AdminTablePanel>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this listing?"
        subject={deleting?.role}
        // Said plainly, because it is the surprising part: the scraper will
        // re-add it. Deleting is only durable for something the source has
        // itself taken down.
        description="It will be removed from the board along with any saved copies. If the source still lists it, the next scrape brings it back."
        confirmLabel="Delete"
        tone="danger"
        busy={dialogBusy}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
};

export default ExternalJobsTable;

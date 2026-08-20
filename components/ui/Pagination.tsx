"use client";

import clsx from "clsx";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";

/**
 * Numbered page controls.
 *
 * Replaces a Load More button that was not paging at all: the page fetched the
 * whole board and revealed six rows at a time from memory. With real paging
 * the reader needs to know where they are and be able to jump, which a
 * one-way "more" button never allowed.
 */

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Shown alongside the controls, e.g. "Showing 11–20 of 49". */
  summary?: string;
}

/**
 * Page numbers to render, with gaps collapsed to an ellipsis.
 *
 * Always shows the first and last page so the ends stay reachable in one
 * click, plus a window around the current page. A board with hundreds of pages
 * must not render hundreds of buttons.
 */
function pageItems(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const nearby = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const pages = [...nearby]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) items.push("gap");
    items.push(p);
  });
  return items;
}

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  summary,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const arrow =
    "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 " +
    "hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 sm:mt-8"
      aria-label="Pagination"
    >
      {summary && <p className="text-sm text-gray-500">{summary}</p>}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={arrow}
        >
          <HiOutlineChevronLeft className="w-4 h-4" />
        </button>

        {pageItems(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1 text-gray-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={clsx(
                "min-w-9 h-9 px-2.5 rounded-lg text-sm font-medium transition-colors",
                item === page
                  ? "bg-primary text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={arrow}
        >
          <HiOutlineChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;

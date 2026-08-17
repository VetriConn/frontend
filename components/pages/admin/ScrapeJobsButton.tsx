"use client";

import { useState } from "react";
import { HiOutlineArrowPath } from "react-icons/hi2";
import { triggerJobScrape, type ScraperSourceSummary } from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";

/**
 * Manual trigger for the job scraper, which otherwise runs every six hours.
 * Useful for pulling fresh listings on demand and for verifying scraper
 * changes without waiting for the cron.
 */
export const ScrapeJobsButton = ({ pages }: { pages?: number }) => {
  const { showToast } = useToaster();
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<ScraperSourceSummary[] | null>(null);

  const handleClick = async () => {
    setIsRunning(true);
    try {
      const summaries = await triggerJobScrape(pages);
      setLastRun(summaries);

      const totals = summaries.reduce(
        (acc, s) => ({
          inserted: acc.inserted + s.inserted,
          updated: acc.updated + s.updated,
          skipped: acc.skipped + s.skipped,
        }),
        { inserted: 0, updated: 0, skipped: 0 },
      );

      showToast({
        type: "success",
        title: "Scrape complete",
        description: `${totals.inserted} new, ${totals.updated} updated, ${totals.skipped} skipped.`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Scrape failed",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={isRunning}
        className="inline-flex items-center gap-2 py-2 px-3.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 font-medium text-sm rounded-lg transition-colors"
      >
        <HiOutlineArrowPath
          className={isRunning ? "w-4 h-4 animate-spin" : "w-4 h-4"}
        />
        {isRunning ? "Scraping…" : "Run scraper now"}
      </button>

      {lastRun && lastRun.length > 0 && (
        <p className="text-xs text-gray-500 text-right">
          {lastRun
            .map(
              (s) =>
                `${s.source}: ${s.found} found, ${s.inserted} new, ${s.updated} updated`,
            )
            .join(" · ")}
        </p>
      )}
    </div>
  );
};

export default ScrapeJobsButton;

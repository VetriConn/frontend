"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  HiOutlineArrowDownTray,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import {
  requestDataExport,
  getDataExportStatus,
  dataExportDownloadUrl,
  type DataExportRecord,
} from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";

/**
 * Requesting and downloading a data archive.
 *
 * Building one reads every collection the account touches and pulls its files
 * out of storage, so it happens in the background and this panel reports on
 * it. The states are: never asked, being built, ready, failed, expired — and
 * the panel has to be honest about which one you are in, because "Download
 * started" over a request that has not finished is how people conclude the
 * feature is broken.
 */

/** While a build is running. Slow enough to be polite, fast enough to feel live. */
const POLL_INTERVAL_MS = 5000;

/** A build that has not moved in this long has almost certainly died. */
const POLL_CEILING_MS = 15 * 60 * 1000;

const IN_PROGRESS: DataExportRecord["status"][] = ["requested", "building"];

const formatBytes = (bytes?: number): string => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  const order = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  return `${(bytes / 1024 ** order).toFixed(order ? 1 : 0)} ${units[order]}`;
};

const formatDate = (value?: string): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

export default function DataExportPanel() {
  const { showToast } = useToaster();
  const [record, setRecord] = useState<DataExportRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pollStartedAt = useRef<number | null>(null);

  const refresh = useCallback(async (): Promise<DataExportRecord | null> => {
    const response = await getDataExportStatus();
    const next = response.data ?? null;
    setRecord(next);
    return next;
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => {
        // A status read that fails leaves the panel in its "never asked"
        // state, which is the safe wrong answer: the worst outcome is
        // someone requesting an archive they already have, and the API
        // answers that by handing back the existing one.
      })
      .finally(() => setIsLoading(false));
  }, [refresh]);

  /**
   * Poll while a build is running, so `ready` arrives without a manual
   * reload. The ceiling matters: without it, a worker that died leaves this
   * tab requesting every five seconds for as long as the page is open.
   */
  useEffect(() => {
    if (!record || !IN_PROGRESS.includes(record.status)) {
      pollStartedAt.current = null;
      return;
    }

    pollStartedAt.current ??= Date.now();

    const timer = setInterval(() => {
      if (
        pollStartedAt.current &&
        Date.now() - pollStartedAt.current > POLL_CEILING_MS
      ) {
        clearInterval(timer);
        return;
      }
      void refresh().catch(() => undefined);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [record, refresh]);

  /**
   * The ready email links here with ?export=<id>. Read from the location
   * directly rather than useSearchParams, which would force a Suspense
   * boundary on a page that otherwise does not need one.
   */
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("export");
    if (!requested) return;

    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), 2400);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleRequest = async () => {
    setIsRequesting(true);
    try {
      const response = await requestDataExport();
      setRecord(response.data);
      showToast({
        type: "success",
        title: "Archive requested",
        description: response.message,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't request your archive",
        description:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const status = record?.status;
  const building = !!status && IN_PROGRESS.includes(status);
  const ready = status === "ready";

  return (
    <div
      ref={panelRef}
      className={clsx(
        "flex items-start gap-3.5 rounded-xl transition-colors duration-500",
        highlight && "bg-amber-50/70 ring-1 ring-amber-200 p-4 -m-4",
      )}
    >
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
        <HiOutlineArrowDownTray className="w-5 h-5 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">
          Download Your Data
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          A complete archive of your account. It covers your profile, applications, postings,
          messages, uploaded files and account activity, with an offline page
          for reading it. It contains other people&apos;s messages and
          applications as well as your own, so keep it somewhere private.
        </p>

        {isLoading ? (
          <div className="h-10 w-48 rounded-lg bg-gray-100 animate-pulse" />
        ) : (
          <>
            {building && (
              <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Putting your archive together
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  This usually takes a few minutes. We&apos;ll email you when
                  it&apos;s ready. You don&apos;t need to stay on this page.
                </p>
              </div>
            )}

            {ready && (
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3">
                <p className="text-sm font-medium text-emerald-900">
                  Your archive is ready
                </p>
                <p className="mt-1 text-xs text-emerald-800">
                  {[
                    formatBytes(record?.size_bytes),
                    record?.expires_at
                      ? `available until ${formatDate(record.expires_at)}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {record?.is_partial && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-800">
                    <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0 mt-px" />
                    <span>
                      {record.omitted_count}{" "}
                      {record.omitted_count === 1 ? "file" : "files"} could
                      not be included. The archive&apos;s README lists which,
                      and why.
                    </span>
                  </p>
                )}
              </div>
            )}

            {status === "failed" && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50/60 px-4 py-3">
                <p className="text-sm font-medium text-red-900">
                  We couldn&apos;t build your archive
                </p>
                <p className="mt-1 text-xs text-red-800">
                  Your data is untouched. This was a problem on our side.
                  Try again, and contact support if it fails twice.
                </p>
              </div>
            )}

            {status === "expired" && (
              <p className="mb-3 text-sm text-gray-500">
                Your last archive has expired and been deleted. Request a new
                one whenever you need it.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {ready && record && (
                // A plain link, not a fetch: the endpoint redirects to a
                // signed storage URL, and fetching it would pull the whole
                // archive through this tab's memory for no reason.
                <a
                  href={dataExportDownloadUrl(record.id)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <HiOutlineArrowDownTray className="w-4 h-4" />
                  Download archive
                </a>
              )}

              <button
                onClick={handleRequest}
                disabled={isRequesting || building}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequesting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    Requesting…
                  </>
                ) : ready ? (
                  "Request a new one"
                ) : status === "failed" ? (
                  "Try again"
                ) : (
                  "Request your archive"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiOutlineBriefcase,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiCheckCircle,
  HiXCircle,
  HiClock,
} from "react-icons/hi2";

// ─── Types ───────────────────────────────────────────────────────────────────

type PostingStatus = "draft" | "pending" | "live" | "rejected";

interface JobPosting {
  id: string;
  title: string;
  type: string;
  location: string;
  updatedAt: string;
  status: PostingStatus;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_POSTINGS: JobPosting[] = [
  {
    id: "1",
    title: "Security Guard",
    type: "Full-time",
    location: "Toronto, Canada",
    updatedAt: "2026-02-16",
    status: "draft",
  },
  {
    id: "2",
    title: "Office Assistant",
    type: "Part-time",
    location: "Remote",
    updatedAt: "2026-02-15",
    status: "draft",
  },
  {
    id: "3",
    title: "Customer Service Rep",
    type: "Part-time",
    location: "Remote",
    updatedAt: "2026-02-14",
    status: "pending",
  },
  {
    id: "4",
    title: "Logistics Coordinator",
    type: "Full-time",
    location: "San Antonio, TX",
    updatedAt: "2026-02-11",
    status: "live",
  },
  {
    id: "5",
    title: "Warehouse Supervisor",
    type: "Full-time",
    location: "Dallas, TX",
    updatedAt: "2026-02-15",
    status: "live",
  },
  {
    id: "6",
    title: "Administrative Assistant",
    type: "Full-time",
    location: "Austin, TX",
    updatedAt: "2026-02-12",
    status: "rejected",
  },
];

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS: { key: PostingStatus; label: string }[] = [
  { key: "draft", label: "Drafts" },
  { key: "pending", label: "Pending" },
  { key: "live", label: "Live" },
  { key: "rejected", label: "Rejected" },
];

// ─── Status badge configs ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PostingStatus }) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
          <HiClock className="w-3 h-3" />
          Pending Review
        </span>
      );
    case "live":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
          <HiCheckCircle className="w-3 h-3" />
          Live
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
          <HiXCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          Draft
        </span>
      );
  }
}

// ─── Action buttons per status ───────────────────────────────────────────────

function PostingActions({ status }: { status: PostingStatus }) {
  switch (status) {
    case "draft":
      return (
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Edit posting"
          >
            <HiOutlinePencilSquare className="w-4 h-4" />
          </button>
          <button className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-colors">
            Submit
          </button>
        </div>
      );
    case "pending":
      return (
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <span className="text-xs text-gray-400">Awaiting admin review</span>
        </div>
      );
    case "live":
      return (
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <HiOutlineEye className="w-3.5 h-3.5" />
            View
          </button>
        </div>
      );
    case "rejected":
      return (
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <HiOutlinePencilSquare className="w-3.5 h-3.5" />
            Edit &amp; Resubmit
          </button>
        </div>
      );
  }
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ManageJobsPage() {
  const [activeTab, setActiveTab] = useState<PostingStatus>("draft");

  const counts = TABS.reduce(
    (acc, tab) => {
      acc[tab.key] = MOCK_POSTINGS.filter((p) => p.status === tab.key).length;
      return acc;
    },
    {} as Record<PostingStatus, number>,
  );

  const filteredPostings = MOCK_POSTINGS.filter((p) => p.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Job Postings
          </h1>
          <Link
            href="/dashboard/employer/post-job"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
          >
            Post New Job
          </Link>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-center pb-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label} ({counts[tab.key]})
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
              )}
            </button>
          ))}
        </div>

        {/* Job Cards */}
        {filteredPostings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineBriefcase className="w-7 h-7" />
            </div>
            <p className="text-sm text-gray-500">
              No {activeTab} postings yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPostings.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between"
              >
                {/* Left — info */}
                <div className="min-w-0 mr-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                    {job.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {job.type} &bull; {job.location} &bull; Updated{" "}
                    {job.updatedAt}
                  </p>
                </div>

                {/* Right — status + actions */}
                <PostingActions status={job.status} />
              </div>
            ))}

            {/* Info banner for Pending tab */}
            {activeTab === "pending" && (
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mt-2">
                <HiClock className="w-4 h-4 text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-700">
                  Jobs submitted for review are typically processed within 24-48
                  hours.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

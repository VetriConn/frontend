"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
  HiOutlineMapPin,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineBriefcase,
  HiOutlineMagnifyingGlass,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineGlobeAlt,
  HiOutlineChevronDown,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import {
  useApplications,
  APPLICATION_STATUS_CONFIG,
  type ApplicationEntry,
  type ApplicationStatus,
  type ApplicationSource,
} from "@/hooks/useApplications";
import { EditDialog } from "@/components/ui/EditDialog";
import { useToaster } from "@/components/ui/Toaster";

// --- Status Badge ---

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = APPLICATION_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.textColor} ${config.bgColor} ${config.borderColor}`}
    >
      <span className="text-[10px]">{config.icon}</span>
      {config.label}
    </span>
  );
}

function SourceBadge({ source }: { source: ApplicationSource }) {
  if (source === "vetriconn") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
        <HiOutlineBriefcase className="w-3 h-3" />
        Via Vetriconn
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
      <HiOutlineGlobeAlt className="w-3 h-3" />
      External
    </span>
  );
}

// --- Stats Card ---

function StatsCard({
  value,
  label,
  color = "text-gray-900",
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 py-5 px-6 text-center flex-1 min-w-[120px]">
      <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

// --- Status Dropdown ---

function StatusDropdown({
  currentStatus,
  onStatusChange,
}: {
  currentStatus: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const statuses: ApplicationStatus[] = [
    "saved",
    "applied",
    "viewed",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
      >
        Update status
        <HiOutlineChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px] py-1 z-50">
            {statuses.map((status) => {
              const config = APPLICATION_STATUS_CONFIG[status];
              return (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                    currentStatus === status
                      ? "bg-red-50 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2 text-[10px]">{config.icon}</span>
                  {config.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// --- Empty State ---

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <HiOutlineBriefcase className="w-9 h-9 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        No applications yet
      </h3>
      <p className="text-sm text-gray-500 max-w-[380px] leading-relaxed mb-8">
        Track all your job applications in one place — whether you applied
        through Vetriconn or elsewhere.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors no-underline"
        >
          <HiOutlineMagnifyingGlass className="text-base" />
          Find Jobs
        </Link>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <HiOutlinePlusCircle className="text-base" />
          Log External Application
        </button>
      </div>
    </div>
  );
}

// --- Application Card ---

function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
  onEditNotes,
}: {
  application: ApplicationEntry;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
  onEditNotes: (app: ApplicationEntry) => void;
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const appliedDate = new Date(application.applied_date).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4 mobile:flex-col">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {application.position}
          </h3>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <StatusBadge status={application.status} />
            <SourceBadge source={application.source} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-2">
            <span className="flex items-center gap-1.5">
              <HiOutlineBuildingOffice2 className="text-sm" />
              {application.company}
            </span>
            {application.location && (
              <span className="flex items-center gap-1.5">
                <HiOutlineMapPin className="text-sm" />
                {application.location}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <HiOutlineCalendarDays className="text-sm" />
            Applied {appliedDate}
          </div>

          {application.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
                <HiOutlineDocumentText className="w-3 h-3" />
                Notes
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {application.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0 items-end mobile:items-start mobile:flex-row mobile:flex-wrap mobile:w-full">
          <StatusDropdown
            currentStatus={application.status}
            onStatusChange={(status) =>
              onStatusChange(application.id, status)
            }
          />

          <button
            onClick={() => onEditNotes(application)}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <HiOutlinePencilSquare className="w-3.5 h-3.5" />
            {application.notes ? "Edit notes" : "Add notes"}
          </button>

          {application.url && (
            <a
              href={application.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover transition-colors no-underline"
            >
              <HiOutlineGlobeAlt className="w-3.5 h-3.5" />
              View posting
            </a>
          )}

          {application.job_id && (
            <Link
              href={`/jobs/${application.job_id}`}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover transition-colors no-underline"
            >
              <HiOutlineBriefcase className="w-3.5 h-3.5" />
              View on Vetriconn
            </Link>
          )}

          {showConfirmDelete ? (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => onDelete(application.id)}
                className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
              >
                Remove
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 cursor-pointer transition-colors mt-1"
            >
              <HiOutlineTrash className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Filter Tabs ---

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Interview", value: "interview" },
  { label: "Offers", value: "offer" },
  { label: "Closed", value: "closed" },
];

// --- Page ---

export default function AppliedJobsPage() {
  const {
    applications,
    isLoaded,
    stats,
    addApplication,
    updateStatus,
    updateNotes,
    removeApplication,
  } = useApplications();
  const { showToast } = useToaster();

  const [activeTab, setActiveTab] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationEntry | null>(null);
  const [notesValue, setNotesValue] = useState("");

  // Add external application form state
  const [addForm, setAddForm] = useState({
    company: "",
    position: "",
    location: "",
    url: "",
    notes: "",
    applied_date: new Date().toISOString().split("T")[0],
  });

  // Filter applications by tab
  const filteredApplications = applications.filter((app) => {
    switch (activeTab) {
      case "active":
        return ["applied", "viewed", "interview"].includes(app.status);
      case "interview":
        return app.status === "interview";
      case "offer":
        return app.status === "offer";
      case "closed":
        return ["rejected", "withdrawn"].includes(app.status);
      default:
        return true;
    }
  });

  const handleAddSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!addForm.company.trim() || !addForm.position.trim()) return;

      addApplication({
        company: addForm.company,
        position: addForm.position,
        location: addForm.location || undefined,
        url: addForm.url || undefined,
        notes: addForm.notes || undefined,
        applied_date: addForm.applied_date || new Date().toISOString(),
        status: "applied",
        source: "external",
      });

      showToast({
        type: "success",
        title: "Application logged",
        description: `${addForm.position} at ${addForm.company} added to your tracker.`,
      });

      setShowAddDialog(false);
      setAddForm({
        company: "",
        position: "",
        location: "",
        url: "",
        notes: "",
        applied_date: new Date().toISOString().split("T")[0],
      });
    },
    [addForm, addApplication, showToast],
  );

  const handleEditNotes = useCallback((app: ApplicationEntry) => {
    setEditingApp(app);
    setNotesValue(app.notes || "");
    setShowNotesDialog(true);
  }, []);

  const handleSaveNotes = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (editingApp) {
        updateNotes(editingApp.id, notesValue);
        showToast({
          type: "success",
          title: "Notes updated",
          description: "Your application notes have been saved.",
        });
      }
      setShowNotesDialog(false);
      setEditingApp(null);
    },
    [editingApp, notesValue, updateNotes, showToast],
  );

  const handleStatusChange = useCallback(
    (id: string, status: ApplicationStatus) => {
      updateStatus(id, status);
      const config = APPLICATION_STATUS_CONFIG[status];
      showToast({
        type: "success",
        title: "Status updated",
        description: `Application marked as "${config.label}".`,
      });
    },
    [updateStatus, showToast],
  );

  const handleDelete = useCallback(
    (id: string) => {
      removeApplication(id);
      showToast({
        type: "success",
        title: "Application removed",
        description: "The application has been removed from your tracker.",
      });
    },
    [removeApplication, showToast],
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[800px] mx-auto px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="flex gap-4">
              <div className="h-24 bg-gray-200 rounded-xl flex-1" />
              <div className="h-24 bg-gray-200 rounded-xl flex-1" />
              <div className="h-24 bg-gray-200 rounded-xl flex-1" />
            </div>
            <div className="h-40 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-2 mobile:flex-col mobile:gap-3">
          <div>
            <h1 className="font-lato text-[28px] font-bold text-gray-900">
              Application Tracker
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Track all your job applications in one place.
            </p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <HiOutlinePlusCircle className="text-base" />
            Log Application
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6" />

        {applications.length === 0 ? (
          <EmptyState onAdd={() => setShowAddDialog(true)} />
        ) : (
          <>
            {/* Stats Row */}
            <div className="flex gap-3 mb-6 overflow-x-auto mobile:gap-2">
              <StatsCard value={stats.total} label="Total" />
              <StatsCard
                value={stats.active}
                label="Active"
                color="text-blue-600"
              />
              <StatsCard
                value={stats.interview}
                label="Interviews"
                color="text-amber-600"
              />
              <StatsCard
                value={stats.offer}
                label="Offers"
                color="text-emerald-600"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.value
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Applications list */}
            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                  No applications match this filter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onEditNotes={handleEditNotes}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add External Application Dialog */}
      <EditDialog
        isOpen={showAddDialog}
        title="Log External Application"
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddSubmit}
        submitLabel="Log Application"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 -mt-2 mb-2">
            Track a job you applied to outside of Vetriconn.
          </p>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Company *
            </label>
            <input
              type="text"
              value={addForm.company}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, company: e.target.value }))
              }
              className="form-input"
              placeholder="e.g. Amazon, Google"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Position *
            </label>
            <input
              type="text"
              value={addForm.position}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, position: e.target.value }))
              }
              className="form-input"
              placeholder="e.g. Operations Manager"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Location
            </label>
            <input
              type="text"
              value={addForm.location}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, location: e.target.value }))
              }
              className="form-input"
              placeholder="e.g. Remote, Austin TX"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Application Date
            </label>
            <input
              type="date"
              value={addForm.applied_date}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, applied_date: e.target.value }))
              }
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Job Posting URL
            </label>
            <input
              type="url"
              value={addForm.url}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, url: e.target.value }))
              }
              className="form-input"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Notes
            </label>
            <textarea
              value={addForm.notes}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, notes: e.target.value }))
              }
              rows={3}
              className="form-input resize-none"
              placeholder="Interview prep, contact person, etc."
            />
          </div>
        </div>
      </EditDialog>

      {/* Edit Notes Dialog */}
      <EditDialog
        isOpen={showNotesDialog}
        title={`Notes \u2014 ${editingApp?.position || ""}`}
        onClose={() => {
          setShowNotesDialog(false);
          setEditingApp(null);
        }}
        onSubmit={handleSaveNotes}
        submitLabel="Save Notes"
      >
        <div>
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            rows={6}
            className="form-input resize-none"
            placeholder="Add notes about this application \u2014 interview prep, key contacts, follow-up dates..."
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-2">
            Notes are saved locally and only visible to you.
          </p>
        </div>
      </EditDialog>
    </div>
  );
}

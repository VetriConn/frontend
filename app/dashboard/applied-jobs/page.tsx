"use client";

import React, { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import type { ApplicationItem } from "@/types/api";
import { getMyApplications, withdrawApplication } from "@/lib/api/jobs";
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
import { useAnchoredMenu } from "@/hooks/useAnchoredMenu";
import { createPortal } from "react-dom";
import { useToaster } from "@/components/ui/Toaster";
import { Avatar } from "@/components/ui/Avatar";
import { AuthGuard } from "@/components/auth/AuthGuard";

// --- Status controls ---

function SourceBadge({ source }: { source: ApplicationSource }) {
  if (source === "vetriconn") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
        <HiOutlineBriefcase className="w-3.5 h-3.5 shrink-0" />
        Via Vetriconn
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
      <HiOutlineGlobeAlt className="w-3.5 h-3.5 shrink-0" />
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
      <div className="text-sm text-gray-600">{label}</div>
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
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const statuses: ApplicationStatus[] = [
    "saved",
    "applied",
    "viewed",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
  ];

  // The KebabMenu keyboard contract, in place: this menu was mouse-only —
  // no roles, no Escape, no arrows — beside a codebase that had already
  // fixed exactly this pattern twice.
  const close = (returnFocus = true) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };
  const moveFocus = (delta: number) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
    );
    if (!items.length) return;
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = (at + delta + items.length) % items.length;
    items[next].focus();
  };
  const handleMenuKeys = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveFocus(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveFocus(-1);
    } else if (e.key === "Tab") {
      // Return focus to the trigger and let Tab proceed from there -
      // closing with focus on an unmounting item strands it on <body>.
      close();
    }
  };
  React.useEffect(() => {
    if (isOpen) {
      menuRef.current
        ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
        ?.focus();
    }
  }, [isOpen]);

  const config = APPLICATION_STATUS_CONFIG[currentStatus];

  // Portaled and viewport-positioned: this menu lives inside a table wrapper
  // with overflow-x-auto, which clipped it at the wrapper's edge with no way
  // to scroll the rest into view. See hooks/useAnchoredMenu.
  const { coords } = useAnchoredMenu(isOpen, triggerRef);

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Status: ${config.label}. Change status`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold border cursor-pointer transition-colors hover:opacity-90 ${config.textColor} ${config.bgColor} ${config.borderColor}`}
      >
        <span className="text-sm leading-none">{config.icon}</span>
        {config.label}
        <HiOutlineChevronDown
          className={`w-3.5 h-3.5 opacity-70 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && typeof document !== "undefined" &&
        createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => close(false)}
          />
          <div
            ref={menuRef}
            role="menu"
            aria-label="Update status"
            onKeyDown={handleMenuKeys}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              zIndex: 9999,
            }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px] py-1"
          >
            {statuses.map((status) => {
              const item = APPLICATION_STATUS_CONFIG[status];
              return (
                <button
                  key={status}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onStatusChange(status);
                    close();
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    currentStatus === status
                      ? "bg-red-50 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2 text-sm">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </>,
        document.body,
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
      <p className="text-sm text-gray-600 max-w-[380px] leading-relaxed mb-8">
        Track all your job applications in one place - whether you applied
        through Vetriconn or elsewhere.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard/find-jobs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors no-underline"
        >
          <HiOutlineMagnifyingGlass className="w-4 h-4 md:w-5 md:h-5" />
          Find Jobs
        </Link>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <HiOutlinePlusCircle className="w-4 h-4 md:w-5 md:h-5" />
          Log External Application
        </button>
      </div>
    </div>
  );
}

// --- Application Card ---


/**
 * The employer's actual decision, from the real Application record - shown
 * beside the self-managed tracker stage so "what the employer did" and "how
 * I'm tracking it" stay visibly separate things. Until this existed, accept/
 * reject decisions were saved server-side and never reached the candidate.
 */
function EmployerDecisionBadge({
  status,
}: {
  status: ApplicationItem["status"];
}) {
  if (status === "pending") return null;
  const styles = {
    reviewed: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
    accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    interview: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
    offer: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    rejected: "bg-gray-100 text-gray-600 ring-gray-200",
    withdrawn: "bg-gray-100 text-gray-600 ring-gray-200",
  } as const;
  const labels = {
    reviewed: "Reviewed by employer",
    accepted: "Accepted by employer",
    interview: "Interview stage",
    offer: "Offer received",
    rejected: "Employer moved on",
    withdrawn: "You withdrew",
  } as const;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold ring-1 ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

/**
 * Two-step withdraw: first press arms it, second confirms. Withdrawing takes
 * the application out of the employer's inbox for good, so a single stray
 * click must not do it.
 */
function WithdrawButton({ onWithdraw }: { onWithdraw: () => Promise<void> }) {
  const [arming, setArming] = useState(false);
  const [busy, setBusy] = useState(false);
  // Arming unmounts the button that had focus; without a handoff, keyboard
  // focus fell to <body> and the confirm was never announced. The handoff
  // works both ways: disarming returns focus to the collapsed button.
  const confirmRef = React.useRef<HTMLButtonElement>(null);
  const armRef = React.useRef<HTMLButtonElement>(null);
  const wasArming = React.useRef(false);
  React.useEffect(() => {
    if (arming) confirmRef.current?.focus();
    else if (wasArming.current) armRef.current?.focus();
    wasArming.current = arming;
  }, [arming]);
  if (!arming) {
    return (
      <button
        ref={armRef}
        type="button"
        onClick={() => setArming(true)}
        className="text-xs font-medium text-gray-500 hover:text-primary underline-offset-2 hover:underline bg-transparent border-none cursor-pointer p-0"
      >
        Withdraw
      </button>
    );
  }
  return (
    <span
      role="alertdialog"
      aria-label="Confirm withdrawal"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setArming(false);
        }
      }}
      className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
    >
      <span className="text-gray-600">Withdraw?</span>
      <button
        ref={confirmRef}
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await onWithdraw();
          } finally {
            setBusy(false);
            setArming(false);
          }
        }}
        className="font-semibold text-primary bg-transparent border-none cursor-pointer p-0 disabled:opacity-60"
      >
        {busy ? "Withdrawing..." : "Yes"}
      </button>
      <button
        type="button"
        onClick={() => setArming(false)}
        className="font-medium text-gray-500 bg-transparent border-none cursor-pointer p-0"
      >
        Keep
      </button>
    </span>
  );
}

function ApplicationCard({
  application,
  employerStatus,
  onStatusChange,
  onDelete,
  onEditNotes,
  onWithdraw,
}: {
  application: ApplicationEntry;
  employerStatus?: ApplicationItem["status"];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
  onEditNotes: (app: ApplicationEntry) => void;
  onWithdraw?: () => Promise<void>;
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const appliedDate = new Date(application.applied_date).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4 mobile:flex-col">
        {/* Company Avatar + Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Avatar
            src={null}
            name={application.company}
            size={48}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {application.position}
            </h3>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <StatusDropdown
                currentStatus={application.status}
                onStatusChange={(status) =>
                  onStatusChange(application.id, status)
                }
              />
              {employerStatus && <EmployerDecisionBadge status={employerStatus} />}
              <SourceBadge source={application.source} />
              {onWithdraw && <WithdrawButton onWithdraw={onWithdraw} />}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-2">
              <span className="inline-flex items-center gap-2">
                <HiOutlineBuildingOffice2 className="w-4 h-4 md:w-5 md:h-5" />
                {application.company}
              </span>
              {application.location && (
                <span className="inline-flex items-center gap-2">
                  <HiOutlineMapPin className="w-4 h-4 md:w-5 md:h-5" />
                  {application.location}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <HiOutlineCalendarDays className="w-4 h-4 md:w-5 md:h-5" />
              Applied {appliedDate}
            </div>

            {application.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium mb-1">
                  <HiOutlineDocumentText className="w-4 h-4 md:w-5 md:h-5" />
                  Notes
                </div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {application.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0 items-end mobile:items-start mobile:flex-row mobile:flex-wrap mobile:w-full">
          <button
            onClick={() => onEditNotes(application)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <HiOutlinePencilSquare className="w-4 h-4 md:w-5 md:h-5" />
            {application.notes ? "Edit notes" : "Add notes"}
          </button>

          {application.url && (
            <a
              href={application.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors no-underline"
            >
              <HiOutlineGlobeAlt className="w-4 h-4 md:w-5 md:h-5" />
              View posting
            </a>
          )}

          {application.job_id && (
            <Link
              href={`/jobs/${application.job_id}`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors no-underline"
            >
              <HiOutlineBriefcase className="w-4 h-4 md:w-5 md:h-5" />
              View on Vetriconn
            </Link>
          )}

          {showConfirmDelete ? (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => onDelete(application.id)}
                className="px-2.5 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
              >
                Remove
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-2.5 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 cursor-pointer transition-colors mt-1"
            >
              <HiOutlineTrash className="w-4 h-4 md:w-5 md:h-5" />
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
  { label: "Interviews", value: "interview" },
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

  // The employer's real decisions, keyed by job identity. The tracker above is
  // self-managed; this is what actually happened on the other side.
  const { data: realApplications, mutate: mutateRealApplications } = useSWR(
    "my-real-applications",
    getMyApplications,
    { revalidateOnFocus: false },
  );
  const employerStatusByJob = useMemo(() => {
    const map = new Map<
      string,
      { status: ApplicationItem["status"]; applicationId: string }
    >();
    for (const item of realApplications ?? []) {
      const entry = { status: item.status, applicationId: item._id };
      const job = item.job_id;
      if (typeof job === "string") map.set(job, entry);
      else if (job) {
        if (job._id) map.set(job._id, entry);
        if (job.id) map.set(job.id, entry);
      }
    }
    return map;
  }, [realApplications]);
  const decisionFor = (jobId?: string) =>
    jobId ? employerStatusByJob.get(jobId)?.status : undefined;
  // The real application behind a tracker row, when it can still be taken
  // back - withdrawing is only meaningful before the employer decides.
  const withdrawableIdFor = (jobId?: string) => {
    const entry = jobId ? employerStatusByJob.get(jobId) : undefined;
    return entry && (entry.status === "pending" || entry.status === "reviewed")
      ? entry.applicationId
      : undefined;
  };
  const handleWithdraw = async (applicationId: string, trackerId?: string) => {
    try {
      await withdrawApplication(applicationId);
      await mutateRealApplications();
      // The tracker row is self-managed state; without this it kept saying
      // "Applied" and counting toward Active after the withdrawal.
      if (trackerId) updateStatus(trackerId, "withdrawn");
      showToast({
        type: "success",
        title: "Application withdrawn",
        description: "The employer will no longer see it in their inbox.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Couldn't withdraw the application",
        description: "Please try again in a moment.",
      });
    }
  };

  // Reconcile the self-managed tracker with what actually happened: an
  // employer decision (or a withdrawal made elsewhere) updates the matching
  // tracker row, which otherwise sat on "Applied" forever while the badge
  // beside it told the real story.
  const RECONCILED: Partial<Record<string, ApplicationStatus>> = useMemo(
    () => ({ accepted: "offer", rejected: "rejected", withdrawn: "withdrawn" }),
    [],
  );
  React.useEffect(() => {
    if (!isLoaded || !realApplications) return;
    for (const app of applications) {
      if (app.source !== "vetriconn" || !app.job_id) continue;
      const real = employerStatusByJob.get(app.job_id);
      const target = real && RECONCILED[real.status];
      if (target && app.status !== target && app.status !== "withdrawn") {
        updateStatus(app.id, target);
      }
    }
  }, [
    isLoaded,
    realApplications,
    applications,
    employerStatusByJob,
    updateStatus,
    RECONCILED,
  ]);

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
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!addForm.company.trim() || !addForm.position.trim()) return;

      // Success is claimed only after the save lands. This used to toast,
      // close the dialog and wipe the form before the request resolved - a
      // failed save silently lost everything typed.
      try {
        await addApplication({
          company: addForm.company,
          position: addForm.position,
          location: addForm.location || undefined,
          url: addForm.url || undefined,
          notes: addForm.notes || undefined,
          applied_date: addForm.applied_date || new Date().toISOString(),
          status: "applied",
          source: "external",
        });
      } catch {
        showToast({
          type: "error",
          title: "Couldn't log the application",
          description: "Nothing was saved. Your entries are still here - try again.",
        });
        return;
      }

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
      <div className="max-w-5xl mx-auto">
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
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-2 mobile:flex-col mobile:gap-3">
          <div>
            <h1 className="font-lato text-xl md:text-3xl font-bold text-gray-900">
              Applied Jobs
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Track all your job applications in one place.
            </p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <HiOutlinePlusCircle className="w-4 h-4 md:w-5 md:h-5" />
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
                <p className="text-gray-500 text-sm">
                  No applications match this filter.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-x-auto">
                  <table className="w-full min-w-[720px] table-fixed">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="w-[26%] px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Position
                        </th>
                        <th className="w-[22%] px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Company
                        </th>
                        <th className="w-[20%] px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="w-[14%] px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Applied
                        </th>
                        <th className="w-[18%] px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((app) => {
                        const appliedDate = new Date(
                          app.applied_date,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                        const withdrawId = withdrawableIdFor(app.job_id);

                        return (
                          <tr
                            key={app.id}
                            className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-4 align-middle">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {app.position}
                              </div>
                              {app.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <HiOutlineMapPin className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{app.location}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar
                                  src={null}
                                  name={app.company}
                                  size={32}
                                  className="shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="text-sm text-gray-900 truncate">
                                    {app.company}
                                  </div>
                                  <div className="mt-0.5">
                                    <SourceBadge source={app.source} />
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <div className="flex flex-col items-start gap-1.5">
                                <StatusDropdown
                                  currentStatus={app.status}
                                  onStatusChange={(status) =>
                                    handleStatusChange(app.id, status)
                                  }
                                />
                                {decisionFor(app.job_id) && (
                                  <EmployerDecisionBadge
                                    status={decisionFor(app.job_id)!}
                                  />
                                )}
                                {withdrawId && (
                                  <WithdrawButton
                                    onWithdraw={() =>
                                      handleWithdraw(withdrawId, app.id)
                                    }
                                  />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
                                <HiOutlineCalendarDays className="w-4 h-4 shrink-0 text-gray-400" />
                                {appliedDate}
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <div className="flex items-center justify-end gap-0.5 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleEditNotes(app)}
                                  className="inline-flex items-center justify-center p-2 h-9 w-9 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                  aria-label={
                                    app.notes ? "Edit notes" : "Add notes"
                                  }
                                  title={app.notes ? "Edit notes" : "Add notes"}
                                >
                                  <HiOutlinePencilSquare className="w-4 h-4" />
                                </button>
                                {(app.url || app.job_id) && (
                                  <a
                                    href={
                                      app.job_id
                                        ? `/jobs/${app.job_id}`
                                        : app.url
                                    }
                                    target={app.url && !app.job_id ? "_blank" : undefined}
                                    rel={
                                      app.url && !app.job_id
                                        ? "noopener noreferrer"
                                        : undefined
                                    }
                                    className="inline-flex items-center justify-center p-2 h-9 w-9 text-gray-500 hover:text-primary hover:bg-red-50 rounded-lg transition-colors"
                                    aria-label="View job posting"
                                    title="View job posting"
                                  >
                                    {app.job_id ? (
                                      <HiOutlineBriefcase className="w-4 h-4" />
                                    ) : (
                                      <HiOutlineGlobeAlt className="w-4 h-4" />
                                    )}
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDelete(app.id)}
                                  className="inline-flex items-center justify-center p-2 h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  aria-label="Remove application"
                                  title="Remove application"
                                >
                                  <HiOutlineTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredApplications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      employerStatus={decisionFor(app.job_id)}
                      onWithdraw={(() => {
                        const id = withdrawableIdFor(app.job_id);
                        return id ? () => handleWithdraw(id, app.id) : undefined;
                      })()}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onEditNotes={handleEditNotes}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Add External Application Dialog */}
        <EditDialog
          isOpen={showAddDialog}
          title="Log External Application"
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleAddSubmit}
          submitLabel="Log Application"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 -mt-2 mb-2">
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
            <p className="text-sm text-gray-500 mt-2">
              Only you can see your notes.
            </p>
          </div>
        </EditDialog>
      </div>
    </AuthGuard>
  );
}

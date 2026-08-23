"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  HiOutlineLifebuoy,
  HiOutlineExclamationTriangle,
  HiOutlineEnvelope,
} from "react-icons/hi2";
import {
  useAdminSupportTickets,
  claimAdminTicket,
  type AdminTicket,
  type TicketStatus,
  type TicketPriority,
  type TicketScope,
  TICKET_TYPE_LABEL,
  TICKET_STATUS_LABEL,
  TICKET_PRIORITY_LABEL,
} from "@/hooks/useAdminSupport";
import {
  AdminPageHeader,
  AdminTablePanel,
  AdminTable,
  AdminTableHead,
  AdminTableTh,
  AdminTableBody,
  AdminTableRow,
  AdminTableTd,
  AdminRowSkeleton,
  AdminEmptyState,
  RowActions,
  ViewAction,
} from "./AdminTablePanel";
import TicketDetailDialog from "./TicketDetailDialog";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToaster } from "@/components/ui/Toaster";

// ─── Stat card (matches dashboard tone but value-tinted) ─────────────────────

type StatTone = "indigo" | "amber" | "rose";

const STAT_TEXT: Record<StatTone, string> = {
  indigo: "text-indigo-600",
  amber: "text-amber-600",
  rose: "text-rose-600",
};

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: StatTone;
}) => (
  <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
    <p className="text-[13px] font-medium text-gray-500">{label}</p>
    <p
      className={clsx(
        "mt-2 text-3xl font-bold tracking-tight tabular-nums",
        STAT_TEXT[tone],
      )}
    >
      {value}
    </p>
  </div>
);

// ─── Pill styles ─────────────────────────────────────────────────────────────

const STATUS_TONE: Record<TicketStatus, string> = {
  open: "bg-amber-50 text-amber-700 ring-amber-200/70",
  in_progress: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  closed: "bg-gray-100 text-gray-600 ring-gray-200/70",
};

const PRIORITY_TONE: Record<TicketPriority, string> = {
  low: "bg-gray-100 text-gray-700 ring-gray-200/70",
  medium: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  high: "bg-rose-50 text-rose-700 ring-rose-200/70",
  critical: "bg-rose-600 text-white ring-rose-700/30",
};

// ─── Filter type ─────────────────────────────────────────────────────────────

type FilterValue = "all" | TicketStatus | "critical_unresolved";

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All Tickets" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "critical_unresolved", label: "Critical (unresolved)" },
];

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
};

// ─── Page ────────────────────────────────────────────────────────────────────

const SupportTickets = () => {
  const { tickets, isLoading, mutate } = useAdminSupportTickets();
  const { userProfile } = useUserProfile();
  const { showToast } = useToaster();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [scope, setScope] = useState<TicketScope>("all");
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);

  const currentAdmin = useMemo(
    () => ({
      id: (userProfile as { id?: string } | null)?.id ?? "",
      name: userProfile?.full_name ?? "Admin",
    }),
    [userProfile],
  );

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const criticalUnresolved = tickets.filter(
      (t) =>
        t.priority === "critical" &&
        t.status !== "resolved" &&
        t.status !== "closed",
    ).length;
    return { total, open, criticalUnresolved };
  }, [tickets]);

  const visible = useMemo(() => {
    let list = tickets;
    if (scope === "mine") {
      list = list.filter((t) => t.assignedTo?.id === currentAdmin.id);
    } else if (scope === "unassigned") {
      list = list.filter((t) => !t.assignedTo);
    }
    if (filter === "all") return list;
    if (filter === "critical_unresolved") {
      return list.filter(
        (t) =>
          t.priority === "critical" &&
          t.status !== "resolved" &&
          t.status !== "closed",
      );
    }
    return list.filter((t) => t.status === filter);
  }, [tickets, filter, scope, currentAdmin.id]);

  const openTicket = useMemo(
    () => tickets.find((t) => t.id === openTicketId) ?? null,
    [tickets, openTicketId],
  );

  const handleTicketChange = async (next: AdminTicket) => {
    await mutate(
      tickets.map((t) => (t.id === next.id ? next : t)),
      false,
    );
  };

  const handleClaim = async (t: AdminTicket) => {
    if (!currentAdmin.id) {
      showToast({ type: "error", title: "You need to be signed in." });
      return;
    }
    if (t.assignedTo?.id === currentAdmin.id) return;
    try {
      await claimAdminTicket(t.id, currentAdmin);
      const updated: AdminTicket = { ...t, assignedTo: currentAdmin };
      await handleTicketChange(updated);
      showToast({
        type: "success",
        title: "Ticket claimed",
        description: t.subject,
      });
    } catch {
      showToast({ type: "error", title: "Could not claim ticket" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Support Tickets"
        description="Manage and respond to user support requests."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        <StatCard label="Total Tickets" value={stats.total} tone="indigo" />
        <StatCard label="Open Tickets" value={stats.open} tone="amber" />
        <StatCard
          label="Critical Unresolved"
          value={stats.criticalUnresolved}
          tone="rose"
        />
      </div>

      {/* Scope + filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Ticket scope"
          className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1"
        >
          {(
            [
              { value: "mine", label: "Mine" },
              { value: "unassigned", label: "Unassigned" },
              { value: "all", label: "All" },
            ] as const
          ).map((opt) => {
            const active = scope === opt.value;
            return (
              <button
                key={opt.value}
                role="tab"
                aria-selected={active}
                onClick={() => setScope(opt.value)}
                className={clsx(
                  "px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary text-white shadow-[0_8px_20px_-12px_rgba(229,62,62,0.7)]"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="ticket-filter"
            className="text-sm font-semibold text-gray-700"
          >
            Filter:
          </label>
          <div className="relative">
            <select
              id="ticket-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterValue)}
              className="appearance-none pl-3.5 pr-9 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>Ticket ID</AdminTableTh>
            <AdminTableTh>Subject</AdminTableTh>
            <AdminTableTh>Submitted By</AdminTableTh>
            <AdminTableTh>Type</AdminTableTh>
            <AdminTableTh>Priority</AdminTableTh>
            <AdminTableTh>Status</AdminTableTh>
            <AdminTableTh>Assignee</AdminTableTh>
            <AdminTableTh>Date</AdminTableTh>
            <AdminTableTh align="right">Actions</AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <AdminRowSkeleton key={i} columns={9} />
                ))
              : visible.map((t) => (
                  <AdminTableRow key={t.id}>
                    <AdminTableTd className="font-semibold text-gray-700 tabular-nums">
                      {t.reference}
                    </AdminTableTd>
                    <AdminTableTd className="font-semibold text-gray-900 max-w-xs">
                      <span className="block truncate" title={t.subject}>
                        {t.subject}
                      </span>
                    </AdminTableTd>
                    <AdminTableTd>{t.submitter.name}</AdminTableTd>
                    <AdminTableTd className="text-gray-600">
                      {TICKET_TYPE_LABEL[t.type]}
                    </AdminTableTd>
                    <AdminTableTd>
                      <span
                        className={clsx(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1",
                          PRIORITY_TONE[t.priority],
                        )}
                      >
                        {TICKET_PRIORITY_LABEL[t.priority]}
                      </span>
                    </AdminTableTd>
                    <AdminTableTd>
                      <span
                        className={clsx(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1",
                          STATUS_TONE[t.status],
                        )}
                      >
                        {TICKET_STATUS_LABEL[t.status]}
                      </span>
                    </AdminTableTd>
                    <AdminTableTd className="text-gray-700">
                      {t.assignedTo ? (
                        <span
                          className={clsx(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1",
                            t.assignedTo.id === currentAdmin.id
                              ? "bg-primary/10 text-primary ring-primary/20"
                              : "bg-gray-100 text-gray-700 ring-gray-200/70",
                          )}
                        >
                          {t.assignedTo.id === currentAdmin.id
                            ? "You"
                            : t.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Unassigned
                        </span>
                      )}
                    </AdminTableTd>
                    <AdminTableTd className="tabular-nums text-gray-600">
                      {formatDate(t.createdAt)}
                    </AdminTableTd>
                    <AdminTableTd align="right">
                      <RowActions>
                        {!t.assignedTo && (
                          <button
                            onClick={() => handleClaim(t)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                          >
                            Claim
                          </button>
                        )}
                        <ViewAction onClick={() => setOpenTicketId(t.id)} />
                      </RowActions>
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>
        {!isLoading && visible.length === 0 && (
          <AdminEmptyState
            title={
              filter === "all"
                ? "No support tickets yet"
                : "No tickets match this filter"
            }
            description={
              filter === "all"
                ? "User-submitted tickets will appear here."
                : "Try a different filter to see other tickets."
            }
            icon={
              filter === "critical_unresolved"
                ? HiOutlineExclamationTriangle
                : filter === "all"
                  ? HiOutlineLifebuoy
                  : HiOutlineEnvelope
            }
          />
        )}
      </AdminTablePanel>

      <TicketDetailDialog
        ticket={openTicket}
        onClose={() => setOpenTicketId(null)}
        onTicketChange={handleTicketChange}
      />
    </div>
  );
};

export default SupportTickets;

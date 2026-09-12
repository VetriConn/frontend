"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import clsx from "clsx";
import { HiOutlineArrowLeft, HiOutlineDocumentText } from "react-icons/hi2";
import {
  useAdminAuditLog,
  actionLabel,
  actionTone,
  type AuditLogEntry,
} from "@/hooks/useAdminAuditLog";
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
  StatusPill,
  AdminLoadError,
  AdminPagination,
} from "./AdminTablePanel";

const formatTimestamp = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const renderMetadata = (meta?: AuditLogEntry["metadata"]) => {
  if (!meta) return null;
  const entries = Object.entries(meta);
  if (entries.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.6875rem] text-gray-500">
      {entries.map(([k, v]) => (
        <span key={k}>
          <span className="font-semibold text-gray-600">{k}:</span> {v}
        </span>
      ))}
    </div>
  );
};

// The event families an admin actually hunts for - a full enum dump would
// be noise; "all" plus these covers the review workflows.
const EVENT_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All events" },
  { value: "LOGIN_SUCCESS", label: "Sign-ins" },
  { value: "LOGIN_FAILURE", label: "Failed sign-ins" },
  { value: "PASSWORD_CHANGE", label: "Password changes" },
  { value: "JOB_APPROVED", label: "Job approvals" },
  { value: "JOB_REJECTED", label: "Job rejections" },
  { value: "COMPANY_SUSPENDED", label: "Company suspensions" },
  { value: "ADMIN_INVITED", label: "Admin invites" },
  { value: "RATE_LIMIT_EXCEEDED", label: "Rate limits" },
];

const AuditLog = () => {
  const [eventType, setEventType] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [eventType]);
  const { entries, pagination, isLoading, isError, mutate } = useAdminAuditLog({
    eventType: eventType || undefined,
    page,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Link
        href="/admin/team"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-primary"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to team
      </Link>

      <AdminPageHeader
        title="Audit Log"
        description="Every admin action that mutates platform data."
      />

      <div className="max-w-xs">
        <CustomDropdown
          name="audit-event-type"
          label="Event type"
          hideHeader
          value={eventType}
          onChange={setEventType}
          options={EVENT_FILTERS}
          placeholder="All events"
        />
      </div>

      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>Action</AdminTableTh>
            <AdminTableTh>Actor</AdminTableTh>
            <AdminTableTh>Target</AdminTableTh>
            <AdminTableTh>When</AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <AdminRowSkeleton key={i} columns={4} />
                ))
              : entries.map((e) => (
                  <AdminTableRow key={e.id}>
                    <AdminTableTd>
                      <div className="flex flex-col gap-1">
                        <StatusPill tone={actionTone(e.action)}>
                          {actionLabel(e.action)}
                        </StatusPill>
                        {renderMetadata(e.metadata)}
                      </div>
                    </AdminTableTd>
                    <AdminTableTd className="font-semibold text-gray-900">
                      {e.actor.name}
                    </AdminTableTd>
                    <AdminTableTd
                      className={clsx(
                        "text-gray-700",
                        !e.target && "text-gray-400 italic",
                      )}
                    >
                      {e.target?.label ?? "-"}
                    </AdminTableTd>
                    <AdminTableTd className="text-gray-600 tabular-nums">
                      {formatTimestamp(e.createdAt)}
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>
        {!isLoading && isError && (
          <AdminLoadError what="the audit log" onRetry={() => mutate()} />
        )}
        {!isLoading && !isError && entries.length === 0 && (
          <AdminEmptyState
            title="No audit entries yet"
            description="Admin actions will be recorded here as they happen."
            icon={HiOutlineDocumentText}
          />
        )}
        <AdminPagination pagination={pagination} onPage={setPage} />
      </AdminTablePanel>
    </div>
  );
};

export default AuditLog;

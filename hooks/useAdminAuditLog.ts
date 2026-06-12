import useSWR from "swr";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuditAction =
  | "admin.invited"
  | "admin.invite_revoked"
  | "admin.role_changed"
  | "admin.suspended"
  | "admin.reinstated"
  | "admin.removed"
  | "job.approved"
  | "job.rejected"
  | "job.unpublished"
  | "employer.suspended"
  | "employer.reinstated"
  | "user.suspended"
  | "user.reinstated"
  | "post.removed"
  | "ticket.replied"
  | "ticket.resolved"
  | "ticket.closed";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actor: { id: string; name: string };
  target?: { id: string; label: string };
  metadata?: Record<string, string>;
  createdAt: string;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK: AuditLogEntry[] = [
  {
    id: "log-1",
    action: "admin.invited",
    actor: { id: "a-1", name: "Admin User" },
    target: { id: "inv-1", label: "rosa@vetriconn.com" },
    metadata: { role: "admin" },
    createdAt: "2026-05-22T14:02:00Z",
  },
  {
    id: "log-2",
    action: "admin.suspended",
    actor: { id: "a-1", name: "Admin User" },
    target: { id: "a-4", label: "Dana Whitford" },
    metadata: { reason: "Repeated policy violations" },
    createdAt: "2026-05-21T10:30:00Z",
  },
  {
    id: "log-3",
    action: "job.approved",
    actor: { id: "a-2", name: "Priya Shah" },
    target: { id: "j-0901", label: "Customer Service Rep — Northern Trust" },
    createdAt: "2026-05-20T16:15:00Z",
  },
  {
    id: "log-4",
    action: "post.removed",
    actor: { id: "a-3", name: "Marcus Lee" },
    target: { id: "p-1", label: "Tips for Returning to Work After Retirement" },
    metadata: { reason: "Spam" },
    createdAt: "2026-05-19T08:45:00Z",
  },
  {
    id: "log-5",
    action: "employer.suspended",
    actor: { id: "a-2", name: "Priya Shah" },
    target: { id: "e-4", label: "Guardian Services" },
    metadata: { reason: "Failed verification" },
    createdAt: "2026-05-18T12:11:00Z",
  },
];

const fetchAuditLog = async (): Promise<AuditLogEntry[]> => {
  // TODO: GET /api/v1/admin/team/audit-log
  await new Promise((r) => setTimeout(r, 200));
  return MOCK;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminAuditLog() {
  const { data, error, isLoading, mutate } = useSWR<AuditLogEntry[]>(
    "/admin/team/audit-log",
    fetchAuditLog,
  );
  return {
    entries: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export const ACTION_LABEL: Record<AuditAction, string> = {
  "admin.invited": "Invited admin",
  "admin.invite_revoked": "Revoked admin invite",
  "admin.role_changed": "Changed admin role",
  "admin.suspended": "Suspended admin",
  "admin.reinstated": "Reinstated admin",
  "admin.removed": "Removed admin",
  "job.approved": "Approved job",
  "job.rejected": "Rejected job",
  "job.unpublished": "Unpublished job",
  "employer.suspended": "Suspended employer",
  "employer.reinstated": "Reinstated employer",
  "user.suspended": "Suspended user",
  "user.reinstated": "Reinstated user",
  "post.removed": "Removed community post",
  "ticket.replied": "Replied to ticket",
  "ticket.resolved": "Resolved ticket",
  "ticket.closed": "Closed ticket",
};

export const ACTION_TONE: Record<AuditAction, "rose" | "emerald" | "indigo" | "amber" | "gray"> = {
  "admin.invited": "indigo",
  "admin.invite_revoked": "rose",
  "admin.role_changed": "amber",
  "admin.suspended": "rose",
  "admin.reinstated": "emerald",
  "admin.removed": "rose",
  "job.approved": "emerald",
  "job.rejected": "rose",
  "job.unpublished": "amber",
  "employer.suspended": "rose",
  "employer.reinstated": "emerald",
  "user.suspended": "rose",
  "user.reinstated": "emerald",
  "post.removed": "rose",
  "ticket.replied": "indigo",
  "ticket.resolved": "emerald",
  "ticket.closed": "gray",
};

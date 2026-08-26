import useSWR from "swr";
import { adminListAuditLogs, type AdminAuditLog } from "@/lib/api/admin";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  /** Raw backend event type (e.g. "JOB_APPROVED"). */
  action: string;
  actor: { id: string; name: string };
  target?: { id: string; label: string };
  metadata?: Record<string, string>;
  createdAt: string;
}

// ─── Mapping ─────────────────────────────────────────────────────────────────

function toEntry(log: AdminAuditLog): AuditLogEntry {
  const metadata: Record<string, string> | undefined = log.metadata
    ? Object.fromEntries(
        Object.entries(log.metadata).map(([k, v]) => [k, String(v)]),
      )
    : undefined;

  return {
    id: log._id,
    action: log.eventType,
    actor: {
      id: log.userId ?? "",
      name: log.email ?? log.userId ?? "System",
    },
    metadata,
    createdAt: log.timestamp,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminAuditLog(params?: {
  eventType?: string;
  userId?: string;
}) {
  const { data, error, isLoading, mutate } = useSWR<AuditLogEntry[]>(
    ["admin-audit-logs", params?.eventType ?? "", params?.userId ?? ""],
    async () =>
      (await adminListAuditLogs({ ...params, limit: 100 })).logs.map(toEntry),
  );
  return {
    entries: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

// ─── Display helpers ─────────────────────────────────────────────────────────

const LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Login",
  LOGIN_FAILURE: "Failed login",
  LOGOUT: "Logout",
  PASSWORD_CHANGE: "Password changed",
  PASSWORD_RESET_REQUEST: "Password reset requested",
  PASSWORD_RESET_COMPLETE: "Password reset",
  ACCOUNT_CREATED: "Account created",
  ACCOUNT_DEACTIVATED: "Account deactivated",
  ACCOUNT_DELETED: "Account deleted",
  ACCOUNT_RESTORED: "Account restored",
  EMAIL_VERIFICATION: "Email verified",
  ROLE_CHANGE: "Role changed",
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
  USER_SUSPENDED: "Suspended member",
  USER_REINSTATED: "Reinstated member",
  ADMIN_INVITED: "Invited admin",
  ADMIN_INVITE_ACCEPTED: "Admin invite accepted",
  ADMIN_ROLE_GRANTED: "Granted admin",
  ADMIN_ROLE_CHANGED: "Changed admin role",
  ADMIN_SUSPENDED: "Suspended admin",
  ADMIN_REINSTATED: "Reinstated admin",
  ADMIN_SESSION_REVOKED: "Revoked admin session",
  STEP_UP_AUTH_SUCCESS: "Step-up verified",
  STEP_UP_AUTH_FAILURE: "Step-up failed",
  JOB_APPROVED: "Approved job",
  JOB_REJECTED: "Rejected job",
  JOB_BULK_ACTION: "Bulk job action",
  JOB_REPORTED: "Job reported",
  JOB_RETURNED_TO_QUEUE: "Job returned to queue",
  COMPANY_APPROVED: "Approved company",
  COMPANY_REJECTED: "Rejected company",
  COMPANY_SUSPENDED: "Suspended company",
  COMPANY_REINSTATED: "Reinstated company",
  COMPANY_VERIFIED: "Verified company",
  COMPANY_MEMBER_REMOVED_BY_ADMIN: "Removed company member",
  COMPANY_MEMBER_REPORTED: "Company member reported",
};

/** A readable label for any event type, mapped or humanized. */
export function actionLabel(eventType: string): string {
  if (LABELS[eventType]) return LABELS[eventType];
  const lower = eventType.replace(/_/g, " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export type ActionTone = "rose" | "emerald" | "indigo" | "amber" | "gray";

/** Colour by outcome — destructive red, positive green, neutral gray. */
export function actionTone(eventType: string): ActionTone {
  if (/(REJECT|SUSPEND|FAIL|DELET|DEACTIV|REMOV|RATE_LIMIT|REPORTED)/.test(eventType))
    return "rose";
  if (/(APPROV|REINSTAT|VERIF|RESTOR|SUCCESS|CREATED|ACCEPTED)/.test(eventType))
    return "emerald";
  if (/(INVIT|LOGIN|GRANT)/.test(eventType)) return "indigo";
  if (/(RETURNED_TO_QUEUE|CHANGE|BULK)/.test(eventType)) return "amber";
  return "gray";
}

/**
 * Admin API — the admin console surface: member moderation, audit log, the
 * dashboard overview, team management, the report queue, community moderation,
 * notifications, and account settings. Job/company moderation live in
 * jobs.ts / companies.ts alongside their public endpoints; support tickets
 * live in support.ts.
 */
import {
  apiFetch,
  API_BASE_URL,
  ApiEnvelope,
  type PaginatedApiEnvelope,
} from "./client";

const ADMIN_URL = `${API_BASE_URL}/api/v1/admin`;

const jsonRequest = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

/** Re-auth credentials for high-risk admin actions (ADM-5 step-up). */
export interface AdminStepUp {
  password: string;
  totp_code?: string;
}

/** The four admin tiers (mirror of the backend permission matrix). */
export type AdminRole = "super_admin" | "reviewer" | "moderator" | "billing";

// ─── Member moderation (GET/POST /api/v1/admin/members) ──────────────────────

export interface AdminMember {
  _id: string;
  full_name: string;
  email: string;
  role: string;
  status?: "active" | "suspended" | "pending" | "deactivated";
  picture?: string;
  onboarding_completed?: boolean;
  last_active_at?: string;
  createdAt?: string;
  /** Total applications this member has submitted (joined server-side). */
  application_count?: number;
}

export interface AdminMemberPage {
  members: AdminMember[];
  total: number;
  page: number;
  limit: number;
}

export async function adminListMembers(params?: {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminMemberPage> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  const res = await apiFetch<ApiEnvelope<AdminMemberPage>>(
    `${API_BASE_URL}/api/v1/admin/members${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
  return res.data ?? { members: [], total: 0, page: 1, limit: 25 };
}

export async function adminGetMember(userId: string): Promise<AdminMember | null> {
  const res = await apiFetch<ApiEnvelope<{ member: AdminMember }>>(
    `${API_BASE_URL}/api/v1/admin/members/${userId}`,
    { method: "GET" },
  );
  return res.data?.member ?? null;
}

export async function adminSuspendMember(
  userId: string,
  reason: string,
): Promise<void> {
  await apiFetch<ApiEnvelope<unknown>>(
    `${API_BASE_URL}/api/v1/admin/members/${userId}/suspend`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  );
}

export async function adminReinstateMember(userId: string): Promise<void> {
  await apiFetch<ApiEnvelope<unknown>>(
    `${API_BASE_URL}/api/v1/admin/members/${userId}/reinstate`,
    { method: "POST" },
  );
}

// ─── Audit-log reader (GET /api/v1/admin/audit-logs) ─────────────────────────

export interface AdminAuditLog {
  _id: string;
  eventType: string;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AdminAuditLogPage {
  logs: AdminAuditLog[];
  total: number;
  page: number;
  limit: number;
}

export async function adminListAuditLogs(params?: {
  eventType?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<AdminAuditLogPage> {
  const qs = new URLSearchParams();
  if (params?.eventType) qs.set("eventType", params.eventType);
  if (params?.userId) qs.set("userId", params.userId);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  const res = await apiFetch<ApiEnvelope<AdminAuditLogPage>>(
    `${API_BASE_URL}/api/v1/admin/audit-logs${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
  return res.data ?? { logs: [], total: 0, page: 1, limit: 50 };
}

// ─── Dashboard overview (GET /api/v1/admin/overview) ─────────────────────────

export interface AdminOverviewStats {
  jobsPending: number;
  activeJobs: number;
  companies: number;
  companiesPending: number;
  users: number;
  openReports: number;
}

export interface AdminOverviewActivity {
  id: string;
  title: string;
  company: string;
  status: "pending" | "approved" | "rejected";
  date: string;
}

export interface AdminOverviewResponse {
  stats: AdminOverviewStats;
  recentActivity: AdminOverviewActivity[];
}

export async function adminGetOverview(): Promise<AdminOverviewResponse> {
  const res = await apiFetch<ApiEnvelope<AdminOverviewResponse>>(
    `${ADMIN_URL}/overview`,
    { method: "GET" },
  );
  return (
    res.data ?? {
      stats: {
        jobsPending: 0,
        activeJobs: 0,
        companies: 0,
        companiesPending: 0,
        users: 0,
        openReports: 0,
      },
      recentActivity: [],
    }
  );
}

// ─── Team management (GET /api/v1/admin/team + identity routes) ──────────────

export interface AdminTeamMember {
  id: string;
  full_name: string;
  email: string;
  picture?: string;
  role: AdminRole;
  status: "active" | "suspended";
  two_factor_enabled: boolean;
  invitedAt: string;
  joinedAt?: string;
  lastSignInAt?: string;
}

export interface AdminTeamInvite {
  id: string;
  email: string;
  role: AdminRole;
  status: "pending" | "expired";
  invitedBy: { id: string; name: string };
  invitedAt: string;
  expiresAt: string;
}

export async function adminGetTeam(): Promise<{
  members: AdminTeamMember[];
  invites: AdminTeamInvite[];
}> {
  const res = await apiFetch<
    ApiEnvelope<{ members: AdminTeamMember[]; invites: AdminTeamInvite[] }>
  >(`${ADMIN_URL}/team`, { method: "GET" });
  return {
    members: res.data?.members ?? [],
    invites: res.data?.invites ?? [],
  };
}

/** Invite a new admin. Step-up (password + TOTP) required. */
export async function adminInvite(
  body: { email: string; full_name: string; admin_role: AdminRole } & AdminStepUp,
): Promise<void> {
  await apiFetch(`${ADMIN_URL}/invites`, jsonRequest("POST", body));
}

export async function adminResendInvite(userId: string): Promise<void> {
  await apiFetch(`${ADMIN_URL}/invites/${userId}/resend`, jsonRequest("POST"));
}

export async function adminRevokeInvite(userId: string): Promise<void> {
  await apiFetch(`${ADMIN_URL}/invites/${userId}/revoke`, jsonRequest("POST"));
}

/** Change an admin's tier. Step-up required. */
export async function adminChangeRole(
  userId: string,
  admin_role: AdminRole,
  creds: AdminStepUp,
): Promise<void> {
  await apiFetch(
    `${ADMIN_URL}/users/${userId}/role`,
    jsonRequest("PATCH", { admin_role, ...creds }),
  );
}

/** Suspend an admin. Reason + step-up required. */
export async function adminSuspendAdmin(
  userId: string,
  reason: string,
  creds: AdminStepUp,
): Promise<void> {
  await apiFetch(
    `${ADMIN_URL}/users/${userId}/suspend`,
    jsonRequest("POST", { reason, ...creds }),
  );
}

/** Reinstate a suspended admin. Step-up required. */
export async function adminReinstateAdmin(
  userId: string,
  creds: AdminStepUp,
): Promise<void> {
  await apiFetch(
    `${ADMIN_URL}/users/${userId}/reinstate`,
    jsonRequest("POST", creds),
  );
}

// ─── Report queue (GET/PATCH /api/v1/admin/reports) ──────────────────────────

export type ReportTargetType = "job" | "company" | "company_member";
export type ReportStatus = "open" | "resolved" | "dismissed";

export interface AdminReport {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  target_label: string;
  target_href?: string;
  reason: string;
  details: string;
  status: ReportStatus;
  reporter: { name: string; email: string } | null;
  member: { id: string; name: string } | null;
  createdAt: string;
  resolvedAt?: string;
}

export async function adminListReports(params?: {
  status?: ReportStatus;
  type?: ReportTargetType;
  page?: number;
  limit?: number;
}): Promise<{
  reports: AdminReport[];
  pagination?: PaginatedApiEnvelope<AdminReport[]>["pagination"];
}> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.type) qs.set("type", params.type);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  const res = await apiFetch<PaginatedApiEnvelope<AdminReport[]>>(
    `${ADMIN_URL}/reports${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
  return { reports: res.data ?? [], pagination: res.pagination };
}

export async function adminReportCounts(): Promise<{
  counts: Record<string, number>;
  total: number;
}> {
  const res = await apiFetch<
    ApiEnvelope<{ counts: Record<string, number>; total: number }>
  >(`${ADMIN_URL}/reports/counts`, { method: "GET" });
  return res.data ?? { counts: {}, total: 0 };
}

export async function adminResolveReport(
  reportId: string,
  status: "resolved" | "dismissed",
): Promise<void> {
  await apiFetch(
    `${ADMIN_URL}/reports/${reportId}`,
    jsonRequest("PATCH", { status }),
  );
}

// ─── Community moderation (GET/PATCH /api/v1/admin/content) ──────────────────

export type ContentModerationStatus = "visible" | "flagged" | "removed";

export interface AdminContentPost {
  id: string;
  title: string;
  body: string;
  author: string;
  author_id: string;
  moderation_status: ContentModerationStatus;
  postedAt: string;
}

export async function adminListContent(params?: {
  status?: ContentModerationStatus;
  page?: number;
  limit?: number;
}): Promise<{
  posts: AdminContentPost[];
  pagination?: PaginatedApiEnvelope<AdminContentPost[]>["pagination"];
}> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  const res = await apiFetch<PaginatedApiEnvelope<AdminContentPost[]>>(
    `${ADMIN_URL}/content${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
  return { posts: res.data ?? [], pagination: res.pagination };
}

export async function adminModerateContent(
  id: string,
  moderation_status: ContentModerationStatus,
  reason?: string,
): Promise<void> {
  await apiFetch(
    `${ADMIN_URL}/content/${id}`,
    jsonRequest("PATCH", { moderation_status, reason }),
  );
}

// ─── Admin notifications (GET/POST /api/v1/admin/notifications) ──────────────

export type AdminNotificationType =
  | "job_submitted"
  | "employer_registered"
  | "user_report"
  | "post_flagged";

export interface AdminNotificationItem {
  id: string;
  type: AdminNotificationType;
  message: string;
  createdAt: string;
  read: boolean;
}

export async function adminListNotifications(): Promise<AdminNotificationItem[]> {
  const res = await apiFetch<
    ApiEnvelope<{ notifications: AdminNotificationItem[] }>
  >(`${ADMIN_URL}/notifications`, { method: "GET" });
  return res.data?.notifications ?? [];
}

export async function adminMarkNotificationRead(key: string): Promise<void> {
  await apiFetch(
    `${ADMIN_URL}/notifications/${encodeURIComponent(key)}/read`,
    jsonRequest("POST"),
  );
}

export async function adminMarkAllNotificationsRead(): Promise<void> {
  await apiFetch(`${ADMIN_URL}/notifications/read-all`, jsonRequest("POST"));
}

// ─── Admin settings (GET/PATCH /api/v1/admin/settings) ───────────────────────

export interface AdminSettingsResponse {
  first_name: string;
  last_name: string;
  email: string;
  notifications: {
    email_alerts: boolean;
    new_job_submissions: boolean;
    user_reports: boolean;
  };
}

export async function adminGetSettings(): Promise<AdminSettingsResponse> {
  const res = await apiFetch<ApiEnvelope<AdminSettingsResponse>>(
    `${ADMIN_URL}/settings`,
    { method: "GET" },
  );
  return res.data;
}

export async function adminUpdateSettingsProfile(body: {
  first_name: string;
  last_name: string;
  email: string;
}): Promise<void> {
  await apiFetch(`${ADMIN_URL}/settings/profile`, jsonRequest("PATCH", body));
}

export async function adminUpdateSettingsPassword(body: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  await apiFetch(`${ADMIN_URL}/settings/password`, jsonRequest("PATCH", body));
}

export async function adminUpdateSettingsNotifications(body: {
  email_alerts: boolean;
  new_job_submissions: boolean;
  user_reports: boolean;
}): Promise<void> {
  await apiFetch(
    `${ADMIN_URL}/settings/notifications`,
    jsonRequest("PATCH", body),
  );
}

/**
 * Support tickets API (admin console). The public contact form persists a
 * ticket server-side; admins triage them here — reply, claim, and change
 * status. Tickets live under /api/v1/admin/support.
 */
import {
  apiFetch,
  API_BASE_URL,
  type ApiEnvelope,
  type PaginatedApiEnvelope,
} from "./client";

const SUPPORT_URL = `${API_BASE_URL}/api/v1/admin/support/tickets`;

const jsonRequest = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketType =
  | "bug_report"
  | "general_inquiry"
  | "report"
  | "account_issue"
  | "payment_issue"
  | "other";

export interface TicketResponse {
  id: string;
  author: "admin" | "user";
  authorName: string;
  message: string;
  createdAt: string;
}

export interface AdminTicket {
  id: string;
  reference: string;
  subject: string;
  description: string;
  submitter: { id: string; name: string; email: string };
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

export type TicketScope = "mine" | "unassigned" | "all";

export async function adminListTickets(params?: {
  scope?: TicketScope;
  status?: TicketStatus;
  page?: number;
  limit?: number;
}): Promise<{
  tickets: AdminTicket[];
  pagination?: PaginatedApiEnvelope<AdminTicket[]>["pagination"];
}> {
  const qs = new URLSearchParams();
  if (params?.scope) qs.set("scope", params.scope);
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  const res = await apiFetch<PaginatedApiEnvelope<AdminTicket[]>>(
    `${SUPPORT_URL}${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
  return { tickets: res.data ?? [], pagination: res.pagination };
}

export async function adminGetTicket(id: string): Promise<AdminTicket> {
  const res = await apiFetch<ApiEnvelope<AdminTicket>>(`${SUPPORT_URL}/${id}`, {
    method: "GET",
  });
  return res.data;
}

export async function adminReplyTicket(
  id: string,
  message: string,
): Promise<TicketResponse> {
  const res = await apiFetch<ApiEnvelope<TicketResponse>>(
    `${SUPPORT_URL}/${id}/replies`,
    jsonRequest("POST", { message }),
  );
  return res.data;
}

export async function adminSetTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<AdminTicket> {
  const res = await apiFetch<ApiEnvelope<AdminTicket>>(
    `${SUPPORT_URL}/${id}/status`,
    jsonRequest("POST", { status }),
  );
  return res.data;
}

export async function adminClaimTicket(id: string): Promise<AdminTicket> {
  const res = await apiFetch<ApiEnvelope<AdminTicket>>(
    `${SUPPORT_URL}/${id}/claim`,
    jsonRequest("POST"),
  );
  return res.data;
}

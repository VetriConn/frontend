import useSWR from "swr";
import {
  adminListTickets,
  adminReplyTicket,
  adminSetTicketStatus,
  adminClaimTicket,
  type AdminTicket,
  type TicketResponse,
  type TicketScope,
  type TicketStatus,
  type TicketPriority,
  type TicketType,
} from "@/lib/api/support";

export type {
  AdminTicket,
  TicketResponse,
  TicketScope,
  TicketStatus,
  TicketPriority,
  TicketType,
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminSupportTickets() {
  const { data, error, isLoading, mutate } = useSWR<AdminTicket[]>(
    "/admin/support/tickets",
    async () => (await adminListTickets()).tickets,
  );
  return {
    tickets: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function replyToAdminTicket(
  ticketId: string,
  message: string,
): Promise<TicketResponse> {
  return adminReplyTicket(ticketId, message);
}

export async function resolveAdminTicket(ticketId: string): Promise<void> {
  await adminSetTicketStatus(ticketId, "resolved");
}

export async function closeAdminTicket(ticketId: string): Promise<void> {
  await adminSetTicketStatus(ticketId, "closed");
}

/**
 * Claim a ticket for the signed-in admin. The `admin` argument is accepted for
 * call-site compatibility but the assignee is the authenticated caller,
 * decided server-side.
 */
export async function claimAdminTicket(
  ticketId: string,
  _admin?: { id: string; name: string },
): Promise<void> {
  await adminClaimTicket(ticketId);
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export const TICKET_TYPE_LABEL: Record<TicketType, string> = {
  bug_report: "Bug Report",
  general_inquiry: "General Inquiry",
  report: "Report",
  account_issue: "Account Issue",
  payment_issue: "Payment Issue",
  other: "Other",
};

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const TICKET_PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

import useSWR from "swr";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  createdAt: string; // ISO
}

export interface AdminTicket {
  id: string; // human-readable e.g. "TKT-001"
  subject: string;
  description: string;
  submitter: { id: string; name: string; email: string };
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  /** Admin user the ticket is currently assigned to. Null if unassigned. */
  assignedTo: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

export type TicketScope = "mine" | "unassigned" | "all";

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK: AdminTicket[] = [
  {
    id: "TKT-001",
    subject: "Cannot apply to job listing",
    description:
      "I'm trying to apply to the 'Administrative Assistant' position but the submit button doesn't respond when I click it. I've tried on both Chrome and Firefox.",
    submitter: {
      id: "u-1",
      name: "James Carter",
      email: "james.carter@email.com",
    },
    type: "bug_report",
    priority: "high",
    status: "open",
    assignedTo: { id: "a-1", name: "Admin User" },
    createdAt: "2025-03-05",
    updatedAt: "2025-03-05",
    responses: [
      {
        id: "r-1",
        author: "admin",
        authorName: "Admin",
        message: "Thank you for reporting this. We're looking into it.",
        createdAt: "2025-03-05",
      },
    ],
  },
  {
    id: "TKT-002",
    subject: "How do I update my resume",
    description:
      "I uploaded an old version of my resume by mistake. Could you walk me through replacing it?",
    submitter: {
      id: "u-2",
      name: "Linda Perez",
      email: "linda.perez@email.com",
    },
    type: "general_inquiry",
    priority: "low",
    status: "open",
    assignedTo: null,
    createdAt: "2025-03-04",
    updatedAt: "2025-03-04",
    responses: [],
  },
  {
    id: "TKT-003",
    subject: "Employer posted misleading description",
    description:
      "The job listing 'Junior Caretaker' contains hours and pay that don't match what was discussed in the interview.",
    submitter: { id: "u-3", name: "Robert Kim", email: "robert.kim@email.com" },
    type: "report",
    priority: "critical",
    status: "in_progress",
    assignedTo: { id: "a-2", name: "Priya Shah" },
    createdAt: "2025-03-03",
    updatedAt: "2025-03-04",
    responses: [
      {
        id: "r-2",
        author: "admin",
        authorName: "Admin",
        message: "We've contacted the employer for clarification.",
        createdAt: "2025-03-04",
      },
    ],
  },
  {
    id: "TKT-004",
    subject: "Account suspended without warning",
    description:
      "I logged in this morning and my account is showing as suspended. I haven't been told why.",
    submitter: {
      id: "u-4",
      name: "Maria Gonzalez",
      email: "m.gonzalez@email.com",
    },
    type: "account_issue",
    priority: "high",
    status: "resolved",
    assignedTo: { id: "a-1", name: "Admin User" },
    createdAt: "2025-03-01",
    updatedAt: "2025-03-02",
    responses: [
      {
        id: "r-3",
        author: "admin",
        authorName: "Admin",
        message:
          "Your account was flagged automatically and has been reinstated. Apologies for the disruption.",
        createdAt: "2025-03-02",
      },
    ],
  },
  {
    id: "TKT-005",
    subject: "Payment not received for completed posting",
    description:
      "I paid for a featured listing 5 days ago but the listing still appears in standard placement.",
    submitter: {
      id: "u-5",
      name: "Thomas Wright",
      email: "t.wright@email.com",
    },
    type: "payment_issue",
    priority: "critical",
    status: "open",
    assignedTo: null,
    createdAt: "2025-03-06",
    updatedAt: "2025-03-06",
    responses: [],
  },
];

const fetchTickets = async (): Promise<AdminTicket[]> => {
  // TODO: GET /api/v1/admin/support/tickets
  await new Promise((r) => setTimeout(r, 200));
  return MOCK;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminSupportTickets() {
  const { data, error, isLoading, mutate } = useSWR<AdminTicket[]>(
    "/admin/support/tickets",
    fetchTickets,
  );
  return {
    tickets: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

// ─── Mutations (mock) ────────────────────────────────────────────────────────

export async function replyToAdminTicket(
  ticketId: string,
  message: string,
): Promise<TicketResponse> {
  // TODO: POST /api/v1/admin/support/tickets/:id/replies  body: { message }
  await new Promise((r) => setTimeout(r, 350));
  console.log("[mock] replied to ticket", ticketId, message);
  return {
    id: `r-${Date.now()}`,
    author: "admin",
    authorName: "Admin",
    message,
    createdAt: new Date().toISOString(),
  };
}

export async function resolveAdminTicket(ticketId: string): Promise<void> {
  // TODO: POST /api/v1/admin/support/tickets/:id/resolve
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] resolved ticket", ticketId);
}

export async function closeAdminTicket(ticketId: string): Promise<void> {
  // TODO: POST /api/v1/admin/support/tickets/:id/close
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] closed ticket", ticketId);
}

export async function claimAdminTicket(
  ticketId: string,
  admin: { id: string; name: string },
): Promise<void> {
  // TODO: POST /api/v1/admin/support/tickets/:id/claim
  await new Promise((r) => setTimeout(r, 250));
  console.log("[mock] claimed ticket", ticketId, "by", admin);
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

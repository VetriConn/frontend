import useSWR from "swr";

export type AdminNotificationType =
  | "job_submitted"
  | "employer_registered"
  | "employer_verified"
  | "user_report"
  | "post_flagged";

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  message: string;
  createdAt: string; // ISO
  read: boolean;
}

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86400 * 1000).toISOString();

const MOCK: AdminNotification[] = [
  {
    id: "n-1",
    type: "job_submitted",
    message: "New job submitted: Part-Time Warehouse Associate",
    createdAt: hoursAgo(2),
    read: false,
  },
  {
    id: "n-2",
    type: "employer_registered",
    message: "New employer registered: SwiftShip Delivery",
    createdAt: hoursAgo(5),
    read: false,
  },
  {
    id: "n-3",
    type: "user_report",
    message: "User report filed against job listing #1042",
    createdAt: daysAgo(1),
    read: false,
  },
  {
    id: "n-4",
    type: "job_submitted",
    message: "New job submitted: Receptionist at HealthFirst",
    createdAt: daysAgo(1),
    read: true,
  },
  {
    id: "n-5",
    type: "employer_verified",
    message: "Employer verified: CivicWorks Inc.",
    createdAt: daysAgo(2),
    read: true,
  },
  {
    id: "n-6",
    type: "post_flagged",
    message: "Community post flagged for review",
    createdAt: daysAgo(3),
    read: true,
  },
];

const fetchNotifications = async (): Promise<AdminNotification[]> => {
  // TODO: GET /api/v1/admin/notifications
  await new Promise((r) => setTimeout(r, 200));
  return MOCK;
};

export function useAdminNotifications() {
  const { data, error, isLoading, mutate } = useSWR<AdminNotification[]>(
    "/admin/notifications",
    fetchNotifications,
  );
  return {
    notifications: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export async function markAdminNotificationRead(id: string): Promise<void> {
  // TODO: POST /api/v1/admin/notifications/:id/read
  await new Promise((r) => setTimeout(r, 200));
  console.log("[mock] marked notification read", id);
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  // TODO: POST /api/v1/admin/notifications/read-all
  await new Promise((r) => setTimeout(r, 200));
  console.log("[mock] marked all notifications read");
}

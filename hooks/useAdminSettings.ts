import useSWR from "swr";

export interface AdminAccountSettings {
  first_name: string;
  last_name: string;
  email: string;
  notifications: {
    email_alerts: boolean;
    new_job_submissions: boolean;
    user_reports: boolean;
  };
}

const MOCK: AdminAccountSettings = {
  first_name: "Admin",
  last_name: "User",
  email: "admin@vetriconn.com",
  notifications: {
    email_alerts: true,
    new_job_submissions: true,
    user_reports: true,
  },
};

const fetchSettings = async (): Promise<AdminAccountSettings> => {
  // TODO: GET /api/v1/admin/settings
  await new Promise((r) => setTimeout(r, 200));
  return MOCK;
};

export function useAdminSettings() {
  const { data, error, isLoading, mutate } = useSWR<AdminAccountSettings>(
    "/admin/settings",
    fetchSettings,
  );
  return {
    settings: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}

export interface AdminProfilePayload {
  first_name: string;
  last_name: string;
  email: string;
}

export interface AdminPasswordPayload {
  current_password: string;
  new_password: string;
}

export interface AdminNotificationsPayload {
  email_alerts: boolean;
  new_job_submissions: boolean;
  user_reports: boolean;
}

export async function updateAdminProfile(
  payload: AdminProfilePayload,
): Promise<void> {
  // TODO: PATCH /api/v1/admin/settings/profile
  await new Promise((r) => setTimeout(r, 350));
  console.log("[mock] updated admin profile", payload);
}

export async function updateAdminPassword(
  payload: AdminPasswordPayload,
): Promise<void> {
  // TODO: PATCH /api/v1/admin/settings/password
  await new Promise((r) => setTimeout(r, 350));
  console.log("[mock] updated admin password");
}

export async function updateAdminNotifications(
  payload: AdminNotificationsPayload,
): Promise<void> {
  // TODO: PATCH /api/v1/admin/settings/notifications
  await new Promise((r) => setTimeout(r, 250));
  console.log("[mock] updated admin notifications", payload);
}

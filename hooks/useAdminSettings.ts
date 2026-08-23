import useSWR from "swr";
import {
  adminGetSettings,
  adminUpdateSettingsProfile,
  adminUpdateSettingsPassword,
  adminUpdateSettingsNotifications,
} from "@/lib/api/admin";

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

export function useAdminSettings() {
  const { data, error, isLoading, mutate } = useSWR<AdminAccountSettings>(
    "/admin/settings",
    async () => await adminGetSettings(),
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
  await adminUpdateSettingsProfile(payload);
}

export async function updateAdminPassword(
  payload: AdminPasswordPayload,
): Promise<void> {
  await adminUpdateSettingsPassword(payload);
}

export async function updateAdminNotifications(
  payload: AdminNotificationsPayload,
): Promise<void> {
  await adminUpdateSettingsNotifications(payload);
}

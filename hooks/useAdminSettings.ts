import useSWR from "swr";
import {
  adminGetSettings,
  adminUpdateSettingsProfile,
  adminUpdateSettingsPassword,
} from "@/lib/api/admin";

interface AdminAccountSettings {
  first_name: string;
  last_name: string;
  email: string;
  notifications: {
    email_alerts: boolean;
    new_job_submissions: boolean;
    user_reports: boolean;
  };
  picture?: string;
  admin_role?: "super_admin" | "reviewer" | "moderator" | "billing";
  admin_status?: "active" | "suspended" | "pending_mfa";
  two_factor_enabled?: boolean;
  last_active_at?: string;
  created_at?: string;
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

interface AdminProfilePayload {
  first_name: string;
  last_name: string;
  email: string;
}

interface AdminPasswordPayload {
  current_password: string;
  new_password: string;
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

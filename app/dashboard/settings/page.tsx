"use client";

import AccountSettings from "@/components/pages/dashboard/settings/AccountSettings";

/**
 * One settings page for one account. There used to be an employer view and a
 * job-seeker view chosen by role; the same person now both applies and hires,
 * so the toggles for each live side by side instead.
 */
export default function SettingsPage() {
  return <AccountSettings />;
}

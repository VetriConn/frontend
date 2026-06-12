"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  useAdminSettings,
  updateAdminProfile,
  updateAdminPassword,
  updateAdminNotifications,
} from "@/hooks/useAdminSettings";
import { AdminPageHeader } from "./AdminTablePanel";
import { useToaster } from "@/components/ui/Toaster";

// ─── Field primitives ────────────────────────────────────────────────────────

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="block text-xs font-semibold text-gray-700 mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition disabled:bg-gray-50 disabled:text-gray-500"
  />
);

const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 md:p-6">
    <header className="mb-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </header>
    {children}
  </section>
);

// ─── Toggle ──────────────────────────────────────────────────────────────────

const Toggle = ({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) => (
  <div className="flex items-start justify-between gap-4 py-3.5">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "shrink-0 relative w-11 h-6 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        checked ? "bg-primary" : "bg-gray-300",
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────

const AdminSettingsPage = () => {
  const { settings, isLoading, mutate } = useAdminSettings();
  const { showToast } = useToaster();

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [notifications, setNotifications] = useState({
    email_alerts: true,
    new_job_submissions: true,
    user_reports: true,
  });
  const [busy, setBusy] = useState(false);

  // Hydrate from server data when it lands.
  useEffect(() => {
    if (!settings) return;
    setProfile({
      first_name: settings.first_name,
      last_name: settings.last_name,
      email: settings.email,
    });
    setNotifications(settings.notifications);
  }, [settings]);

  const passwordRequested =
    password.current_password ||
    password.new_password ||
    password.confirm_password;
  const passwordValid =
    !passwordRequested ||
    (password.current_password.length >= 6 &&
      password.new_password.length >= 8 &&
      password.new_password === password.confirm_password);

  const handleSave = async () => {
    if (!passwordValid) {
      showToast({
        type: "error",
        title: "Password fields don't match",
        description:
          "New password must be 8+ characters and match the confirmation.",
      });
      return;
    }
    setBusy(true);
    try {
      await updateAdminProfile(profile);
      if (passwordRequested) {
        await updateAdminPassword({
          current_password: password.current_password,
          new_password: password.new_password,
        });
        setPassword({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      }
      await updateAdminNotifications(notifications);
      await mutate(
        settings ? { ...settings, ...profile, notifications } : settings,
        false,
      );
      showToast({
        type: "success",
        title: "Settings saved",
      });
    } catch {
      showToast({ type: "error", title: "Could not save settings" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <AdminPageHeader
        title="Settings"
        description="Manage your admin account"
      />

      <SectionCard title="Admin Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name">
            <Input
              value={profile.first_name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, first_name: e.target.value }))
              }
              disabled={isLoading}
            />
          </Field>
          <Field label="Last Name">
            <Input
              value={profile.last_name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, last_name: e.target.value }))
              }
              disabled={isLoading}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email">
              <Input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, email: e.target.value }))
                }
                disabled={isLoading}
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Password"
        description="Leave blank to keep your current password"
      >
        <div className="space-y-4">
          <Field label="Current Password">
            <Input
              type="password"
              value={password.current_password}
              onChange={(e) =>
                setPassword((p) => ({
                  ...p,
                  current_password: e.target.value,
                }))
              }
              autoComplete="current-password"
            />
          </Field>
          <Field label="New Password">
            <Input
              type="password"
              value={password.new_password}
              onChange={(e) =>
                setPassword((p) => ({ ...p, new_password: e.target.value }))
              }
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm New Password">
            <Input
              type="password"
              value={password.confirm_password}
              onChange={(e) =>
                setPassword((p) => ({
                  ...p,
                  confirm_password: e.target.value,
                }))
              }
              autoComplete="new-password"
            />
          </Field>
          {passwordRequested && !passwordValid && (
            <p className="text-xs text-rose-600">
              New password must be at least 8 characters and match the
              confirmation.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Notification Preferences">
        <div className="divide-y divide-gray-100 -my-3.5">
          <Toggle
            label="Email Notifications"
            description="Receive email alerts for important events"
            checked={notifications.email_alerts}
            onChange={(v) =>
              setNotifications((n) => ({ ...n, email_alerts: v }))
            }
          />
          <Toggle
            label="New Job Submissions"
            description="Get notified when new jobs need review"
            checked={notifications.new_job_submissions}
            onChange={(v) =>
              setNotifications((n) => ({ ...n, new_job_submissions: v }))
            }
          />
          <Toggle
            label="User Reports"
            description="Get notified about user-submitted reports"
            checked={notifications.user_reports}
            onChange={(v) =>
              setNotifications((n) => ({ ...n, user_reports: v }))
            }
          />
        </div>
      </SectionCard>

      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={busy || isLoading}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_8px_20px_-12px_rgba(229,62,62,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import clsx from "clsx";
import {
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineKey,
  HiOutlineChevronRight,
  HiOutlineCheckBadge,
  HiOutlineExclamationTriangle,
  HiOutlinePencilSquare,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineLockClosed,
  HiOutlineComputerDesktop,
  HiOutlineEnvelope,
  HiOutlineCalendarDays,
  HiOutlineXMark,
} from "react-icons/hi2";
import {
  useAdminSettings,
  updateAdminProfile,
  updateAdminPassword,
  updateAdminNotifications,
} from "@/hooks/useAdminSettings";
import {
  adminListOwnSessions,
  adminRevokeOwnSession,
  type AdminSessionRow,
} from "@/lib/api/admin";
import { useToaster } from "@/components/ui/Toaster";
import { getInitials } from "@/lib/initials";
import { ROLE_LABEL } from "@/hooks/useAdminTeam";
import { isSuperAdmin } from "@/lib/admin-permissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import TwoFactorSetupDialog from "@/components/security/TwoFactorSetupDialog";
import DisableTwoFactorDialog from "@/components/security/DisableTwoFactorDialog";

/**
 * The admin's own account page — the staff counterpart to the member profile.
 *
 * Same shape as /dashboard/profile (identity header, section cards each with
 * their own Edit, quick actions alongside), but the facts are the ones an admin
 * actually has: tier, 2FA, live console sessions, last sign-in. Sections read
 * as values until you choose to edit one, so the page is a status view first
 * and a form second.
 */

// ─── Primitives ──────────────────────────────────────────────────────────────

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition disabled:bg-gray-50 disabled:text-gray-500"
  />
);

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="block text-sm font-semibold text-gray-900 mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

/** A read-only fact, matching the member profile's labelled-value rows. */
const ReadField = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    {Icon && (
      <div className="w-9 h-9 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
    )}
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="text-sm font-medium text-gray-900 break-words mt-0.5">
        {value || <span className="text-gray-400">Not set</span>}
      </div>
    </div>
  </div>
);

const SectionCard = ({
  title,
  icon: Icon,
  description,
  action,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="bg-white rounded-xl border border-gray-200 p-6 mobile:p-5">
    <header className="flex items-start justify-between gap-3 mb-5">
      <div className="min-w-0">
        <div className="inline-flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h2 className="font-lato text-lg font-bold text-gray-900">{title}</h2>
        </div>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {action}
    </header>
    {children}
  </section>
);

const EditButton = ({
  editing,
  onClick,
}: {
  editing: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors",
      editing
        ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        : "bg-red-50 text-primary hover:bg-red-100",
    )}
  >
    {editing ? (
      "Cancel"
    ) : (
      <>
        <HiOutlinePencilSquare className="w-4 h-4" />
        Edit
      </>
    )}
  </button>
);

const Toggle = ({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
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
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "shrink-0 relative w-11 h-6 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50",
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

const QuickAction = ({
  href,
  onClick,
  icon: Icon,
  title,
  subtitle,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) => {
  const body = (
    <>
      <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>
      <HiOutlineChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
    </>
  );
  const className =
    "w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors";
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <button onClick={onClick} className={className}>
      {body}
    </button>
  );
};

// ─── Formatting ──────────────────────────────────────────────────────────────

const formatRelative = (iso?: string) => {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Never";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

/** Shorten a UA string to something a human can recognise their device by. */
const describeDevice = (ua?: string) => {
  if (!ua) return "Unknown device";
  const browser = /Edg/.test(ua)
    ? "Edge"
    : /Chrome/.test(ua)
      ? "Chrome"
      : /Safari/.test(ua)
        ? "Safari"
        : /Firefox/.test(ua)
          ? "Firefox"
          : "Browser";
  const os = /Mac OS X|Macintosh/.test(ua)
    ? "macOS"
    : /Windows/.test(ua)
      ? "Windows"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad|iOS/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} on ${os}` : browser;
};

// ─── Page ────────────────────────────────────────────────────────────────────

const AdminSettingsPage = () => {
  const { settings, isLoading, mutate } = useAdminSettings();
  const { userProfile, mutateProfile } = useUserProfile();
  const isSuper = isSuperAdmin(userProfile);
  const { showToast } = useToaster();

  const {
    data: sessions,
    mutate: mutateSessions,
  } = useSWR<AdminSessionRow[]>("admin-own-sessions", adminListOwnSessions);

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
  const [twoFactorDisableOpen, setTwoFactorDisableOpen] = useState(false);

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
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setProfile({
      first_name: settings.first_name,
      last_name: settings.last_name,
      email: settings.email,
    });
    setNotifications(settings.notifications);
  }, [settings]);

  const fullName =
    `${profile.first_name} ${profile.last_name}`.trim() || "Admin";
  const twoFactorEnabled = !!settings?.two_factor_enabled;

  // The header's at-a-glance verdict, standing in for the member page's
  // "profile % complete": what actually protects a console account.
  const securityChecks = [
    { label: "Two-factor authentication", ok: twoFactorEnabled },
    { label: "Password set", ok: !userProfile?.must_change_password },
    { label: "Contact email on file", ok: !!profile.email },
  ];
  const securityScore = securityChecks.filter((c) => c.ok).length;
  const securityStrong = securityScore === securityChecks.length;

  const passwordValid =
    password.current_password.length >= 6 &&
    password.new_password.length >= 8 &&
    password.new_password === password.confirm_password;

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateAdminProfile(profile);
      await mutate(settings ? { ...settings, ...profile } : settings, false);
      setEditingProfile(false);
      showToast({ type: "success", title: "Profile updated" });
    } catch (err) {
      showToast({
        type: "error",
        title: "Could not update profile",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordValid) {
      showToast({
        type: "error",
        title: "Check the password fields",
        description:
          "New password must be 8+ characters and match the confirmation.",
      });
      return;
    }
    setSavingPassword(true);
    try {
      await updateAdminPassword({
        current_password: password.current_password,
        new_password: password.new_password,
      });
      setPassword({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setEditingPassword(false);
      // Other devices are signed out server-side; refresh what we show.
      await Promise.all([mutate(), mutateSessions()]);
      showToast({
        type: "success",
        title: "Password changed",
        description: "You've been signed out on your other devices.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Could not change password",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // Notification toggles save on change — no separate submit for three switches.
  const handleToggleNotification = async (
    key: keyof typeof notifications,
    value: boolean,
  ) => {
    const next = { ...notifications, [key]: value };
    setNotifications(next);
    setSavingNotifications(true);
    try {
      await updateAdminNotifications(next);
      await mutate(
        settings ? { ...settings, notifications: next } : settings,
        false,
      );
    } catch (err) {
      setNotifications(notifications);
      showToast({
        type: "error",
        title: "Could not update notifications",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleTwoFactorChange = async () => {
    setTwoFactorSetupOpen(false);
    setTwoFactorDisableOpen(false);
    await Promise.all([mutate(), mutateProfile?.()]);
  };

  const handleRevokeSession = async (session: AdminSessionRow) => {
    try {
      await adminRevokeOwnSession(session._id);
      await mutateSessions();
      showToast({ type: "success", title: "Session signed out" });
    } catch (err) {
      showToast({
        type: "error",
        title: "Could not sign out session",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
          My Admin Profile
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Review your access and update your account
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
        <div className="space-y-4 md:space-y-6 lg:col-span-2">
          {/* ── Identity header ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mobile:p-5">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="shrink-0 flex justify-center sm:justify-start">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-red-700 text-white flex items-center justify-center text-xl font-bold overflow-hidden ring-4 ring-primary/10">
                  {settings?.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings.picture}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(fullName)
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-lato text-xl md:text-2xl font-bold text-gray-900">
                    {isLoading ? "…" : fullName}
                  </h2>
                  {settings?.admin_role && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/70 text-xs font-semibold">
                      <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                      {ROLE_LABEL[settings.admin_role]}
                    </span>
                  )}
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1",
                      securityStrong
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
                        : "bg-amber-50 text-amber-700 ring-amber-200/70",
                    )}
                    title={securityChecks
                      .map((c) => `${c.ok ? "✓" : "✗"} ${c.label}`)
                      .join("\n")}
                  >
                    {securityStrong ? (
                      <HiOutlineCheckBadge className="w-3.5 h-3.5" />
                    ) : (
                      <HiOutlineExclamationTriangle className="w-3.5 h-3.5" />
                    )}
                    Security {securityScore}/{securityChecks.length}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{profile.email}</p>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    {twoFactorEnabled ? (
                      <>
                        <HiOutlineCheckBadge className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">
                          2FA enabled
                        </span>
                      </>
                    ) : (
                      <>
                        <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-700 font-medium">
                          2FA off
                        </span>
                      </>
                    )}
                  </span>
                  <span className="text-gray-500">
                    Last active:{" "}
                    <span className="text-gray-700 font-medium">
                      {formatRelative(settings?.last_active_at)}
                    </span>
                  </span>
                  {settings?.created_at && (
                    <span className="text-gray-500">
                      Admin since:{" "}
                      <span className="text-gray-700 font-medium">
                        {formatDate(settings.created_at)}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Account information ── */}
          <SectionCard
            title="Account Information"
            icon={HiOutlineUser}
            action={
              <EditButton
                editing={editingProfile}
                onClick={() => {
                  if (editingProfile && settings) {
                    setProfile({
                      first_name: settings.first_name,
                      last_name: settings.last_name,
                      email: settings.email,
                    });
                  }
                  setEditingProfile((v) => !v);
                }}
              />
            }
          >
            {editingProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name">
                    <Input
                      value={profile.first_name}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, first_name: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Last Name">
                    <Input
                      value={profile.last_name}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, last_name: e.target.value }))
                      }
                    />
                  </Field>
                </div>
                <Field label="Email">
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </Field>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-60"
                  >
                    {savingProfile ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ReadField
                  icon={HiOutlineUser}
                  label="Name"
                  value={isLoading ? "…" : fullName}
                />
                <ReadField
                  icon={HiOutlineEnvelope}
                  label="Email"
                  value={profile.email}
                />
                <ReadField
                  icon={HiOutlineShieldCheck}
                  label="Admin role"
                  value={
                    settings?.admin_role
                      ? ROLE_LABEL[settings.admin_role]
                      : undefined
                  }
                />
                <ReadField
                  icon={HiOutlineCalendarDays}
                  label="Admin since"
                  value={formatDate(settings?.created_at)}
                />
              </div>
            )}
          </SectionCard>

          {/* ── Security ── */}
          <SectionCard
            title="Security"
            icon={HiOutlineLockClosed}
            description="Password and two-factor authentication for your console account."
          >
            <div className="divide-y divide-gray-100">
              {/* Password */}
              <div className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Password
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Changing it signs you out everywhere else.
                    </p>
                  </div>
                  <EditButton
                    editing={editingPassword}
                    onClick={() => {
                      setPassword({
                        current_password: "",
                        new_password: "",
                        confirm_password: "",
                      });
                      setEditingPassword((v) => !v);
                    }}
                  />
                </div>

                {editingPassword && (
                  <div className="space-y-4 mt-4">
                    <Field label="Current password">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="New password">
                        <Input
                          type="password"
                          value={password.new_password}
                          onChange={(e) =>
                            setPassword((p) => ({
                              ...p,
                              new_password: e.target.value,
                            }))
                          }
                          autoComplete="new-password"
                        />
                      </Field>
                      <Field label="Confirm new password">
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
                    </div>
                    {(password.current_password ||
                      password.new_password ||
                      password.confirm_password) &&
                      !passwordValid && (
                        <p className="text-xs text-rose-600">
                          New password must be at least 8 characters and match
                          the confirmation.
                        </p>
                      )}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSavePassword}
                        disabled={savingPassword || !passwordValid}
                        className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-60"
                      >
                        {savingPassword ? "Saving…" : "Change password"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2FA — handled here rather than linking to the member settings
                  page, which admins can't open. */}
              <div className="py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    Two-factor authentication
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {twoFactorEnabled
                      ? "Required at sign-in and for high-risk admin actions."
                      : "Strongly recommended — admin actions need a second factor."}
                  </p>
                </div>
                <button
                  onClick={() =>
                    twoFactorEnabled
                      ? setTwoFactorDisableOpen(true)
                      : setTwoFactorSetupOpen(true)
                  }
                  className={clsx(
                    "shrink-0 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors",
                    twoFactorEnabled
                      ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      : "bg-red-50 text-primary hover:bg-red-100",
                  )}
                >
                  {twoFactorEnabled ? "Turn off" : "Set up"}
                </button>
              </div>
            </div>
          </SectionCard>

          {/* ── Active sessions ── */}
          <SectionCard
            title="Active Sessions"
            icon={HiOutlineComputerDesktop}
            description="Where your admin account is currently signed in."
          >
            {!sessions ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-gray-100 rounded-lg animate-shimmer"
                  />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-gray-500">No other active sessions.</p>
            ) : (
              <ul className="divide-y divide-gray-100 -my-3">
                {sessions.map((s) => (
                  <li
                    key={s._id}
                    className="flex items-center gap-3 py-3.5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                      <HiOutlineComputerDesktop className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {describeDevice(s.userAgent)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.ip ? `${s.ip} · ` : ""}
                        Active {formatRelative(s.lastSeenAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(s)}
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                    >
                      <HiOutlineXMark className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* ── Notifications ── */}
          <SectionCard
            title="Notification Preferences"
            icon={HiOutlineBell}
            description="Changes save automatically."
          >
            <div className="divide-y divide-gray-100 -my-3.5">
              <Toggle
                label="Email Notifications"
                description="Receive email alerts for important events"
                checked={notifications.email_alerts}
                disabled={savingNotifications}
                onChange={(v) => handleToggleNotification("email_alerts", v)}
              />
              <Toggle
                label="New Job Submissions"
                description="Get notified when new jobs need review"
                checked={notifications.new_job_submissions}
                disabled={savingNotifications}
                onChange={(v) =>
                  handleToggleNotification("new_job_submissions", v)
                }
              />
              <Toggle
                label="User Reports"
                description="Get notified about user-submitted reports"
                checked={notifications.user_reports}
                disabled={savingNotifications}
                onChange={(v) => handleToggleNotification("user_reports", v)}
              />
            </div>
          </SectionCard>
        </div>

        {/* ── Quick actions ── */}
        <aside className="space-y-4 md:space-y-6 lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <h2 className="font-lato text-lg font-bold text-gray-900 px-4 pt-5 pb-3">
              Quick Actions
            </h2>
            <div className="divide-y divide-gray-100">
              <QuickAction
                href="/admin"
                icon={HiOutlineShieldCheck}
                title="Admin dashboard"
                subtitle="Platform overview and queues"
              />
              {isSuper && (
                <QuickAction
                  href="/admin/team"
                  icon={HiOutlineUserGroup}
                  title="Admin team"
                  subtitle="Manage who has console access"
                />
              )}
              {isSuper && (
                <QuickAction
                  href="/admin/team/audit-log"
                  icon={HiOutlineDocumentText}
                  title="Audit log"
                  subtitle="Every admin action taken"
                />
              )}
              <QuickAction
                onClick={() =>
                  twoFactorEnabled
                    ? setTwoFactorDisableOpen(true)
                    : setTwoFactorSetupOpen(true)
                }
                icon={HiOutlineKey}
                title="Two-factor authentication"
                subtitle={twoFactorEnabled ? "Enabled" : "Not set up yet"}
              />
            </div>
          </div>

          {/* Security checklist — what the header badge is counting. */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-lato text-lg font-bold text-gray-900 mb-3">
              Security checklist
            </h2>
            <ul className="space-y-2.5">
              {securityChecks.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 text-sm">
                  {c.ok ? (
                    <HiOutlineCheckBadge className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  ) : (
                    <HiOutlineExclamationTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                  )}
                  <span
                    className={c.ok ? "text-gray-600" : "text-gray-900 font-medium"}
                  >
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <TwoFactorSetupDialog
        open={twoFactorSetupOpen}
        onClose={() => setTwoFactorSetupOpen(false)}
        onEnrolled={handleTwoFactorChange}
      />
      <DisableTwoFactorDialog
        open={twoFactorDisableOpen}
        onClose={() => setTwoFactorDisableOpen(false)}
        onDisabled={handleTwoFactorChange}
      />
    </div>
  );
};

export default AdminSettingsPage;

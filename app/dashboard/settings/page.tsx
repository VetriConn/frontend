"use client";

import React, { useState } from "react";
import {
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineEnvelope,
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineEyeSlash,
  HiOutlineEye,
  HiOutlineArrowDownTray,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { useAccessibility, type TextSize } from "@/hooks/useAccessibility";
import { useToaster } from "@/components/ui/Toaster";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  changePassword as changePasswordApi,
  requestDataExport,
  deactivateAccount as deactivateAccountApi,
  updateUserSettings,
} from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SettingsState {
  // Job Preferences
  jobSeekingStatus: string;
  preferredWorkType: string;
  preferredLocation: string;
  experienceLevel: string;

  // Notifications
  emailNotifications: boolean;
  jobAlerts: boolean;
  communityUpdates: boolean;

  // Two-Step Verification
  twoStepVerification: boolean;

  // Privacy
  profileVisibility: string;
}

// ─── Toggle Component ───────────────────────────────────────────────────────────

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? "bg-primary" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Section Card ───────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mobile:p-5 mb-5">
      <h2 className="font-lato text-lg font-bold text-gray-900 mb-1">
        {title}
      </h2>
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
      {children}
    </div>
  );
}

// ─── Select Dropdown ────────────────────────────────────────────────────────────

function SelectField({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="form-input w-full text-left flex items-center justify-between gap-2 cursor-pointer"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate text-gray-900">
            {selectedOption?.label || "Select..."}
          </span>
          <HiOutlineChevronDown
            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <ul
            role="listbox"
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[240px] overflow-y-auto py-1"
          >
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  opt.value === value
                    ? "bg-red-50 text-red-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1.5">{hint}</p>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AccountSettingsPage() {
  // ─── Fetch user profile from DB ───────────────────────────────────────────
  const { userProfile, isLoading: profileLoading } = useUserProfile();
  const { showToast } = useToaster();

  const [settings, setSettings] = useState<SettingsState>({
    jobSeekingStatus: userProfile?.job_seeking_status || "none",
    preferredWorkType: "hybrid",
    preferredLocation: "within-25",
    experienceLevel: "senior",

    emailNotifications: true,
    jobAlerts: true,
    communityUpdates: false,

    twoStepVerification: false,

    profileVisibility: "employers-only",
  });

  const update = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Persist to backend (fire-and-forget)
    updateUserSettings(newSettings).catch(() => {
      // Settings save failed silently — will retry on next toggle
    });
  };

  // ─── Accessibility ────────────────────────────────────────────────────────
  const { textSize, highContrast, setTextSize, setHighContrast } =
    useAccessibility();

  // ─── Change Password Modal State ──────────────────────────────────────────
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // ─── Data Download & Account Deactivation ─────────────────────────────────
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [showDeactivatePassword, setShowDeactivatePassword] = useState(false);
  const [deactivateConfirmText, setDeactivateConfirmText] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  // Password requirements
  const passwordRequirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "One number", met: /[0-9]/.test(newPassword) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const allRequirementsMet = passwordRequirements.every((r) => r.met);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmitPassword =
    currentPassword.length > 0 && allRequirementsMet && passwordsMatch;

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordSaving(false);
    setPasswordSuccess(false);
    setPasswordError("");
  };

  const handleOpenPasswordModal = () => {
    resetPasswordForm();
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    resetPasswordForm();
  };

  const handleChangePassword = async () => {
    if (!canSubmitPassword) return;
    setPasswordError("");
    setPasswordSaving(true);
    try {
      await changePasswordApi(currentPassword, newPassword);
      setPasswordSaving(false);
      setPasswordSuccess(true);
      // Auto-close after success
      setTimeout(() => {
        handleClosePasswordModal();
      }, 2000);
    } catch (error) {
      setPasswordSaving(false);
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Failed to change password. Please try again.",
      );
    }
  };

  // ─── Data Download Handler ────────────────────────────────────────────────
  const handleDataDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      const blob = await requestDataExport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vetriconn-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch {
      showToast({
        type: "error",
        title: "Export failed",
        description: "Failed to download your data. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // ─── Account Deactivation Handler ─────────────────────────────────────────
  const handleDeactivateAccount = async () => {
    if (deactivateConfirmText !== "DEACTIVATE" || !deactivatePassword) return;
    setIsDeactivating(true);
    setDeactivateError("");
    try {
      await deactivateAccountApi(deactivatePassword);
      // Clear auth and redirect to homepage
      window.location.href = "/";
    } catch (error) {
      setDeactivateError(
        error instanceof Error
          ? error.message
          : "Failed to deactivate account. Please try again or contact support.",
      );
      setIsDeactivating(false);
    }
  };

  const handleCloseDeactivateModal = () => {
    setShowDeactivateModal(false);
    setDeactivatePassword("");
    setDeactivateConfirmText("");
    setShowDeactivatePassword(false);
    setDeactivateError("");
    setIsDeactivating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-lato text-[28px] font-bold text-gray-900 mb-1">
            Account settings
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Manage your account preferences, security, and privacy settings.
          </p>
        </div>

        {/* ─── 1. Account Information (read-only) ─── */}
        <SectionCard
          title="Account Information"
          subtitle="Your sign-in email and profile link."
        >
          {profileLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-10 bg-gray-100 rounded-lg" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Email Address (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userProfile?.email || ""}
                  disabled
                  className="form-input disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Your email is used to sign in and cannot be changed here.
                  Contact support if you need to update it.
                </p>
              </div>

              {/* Link to profile */}
              <a
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
              >
                <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                Edit your name, bio, and contact info on your Profile page
              </a>
            </div>
          )}
        </SectionCard>

        {/* ─── 2. Password & Security ─── */}
        <SectionCard
          title="Password & Security"
          subtitle="Keep your account safe with a strong password and extra protection."
        >
          <div className="space-y-6">
            {/* Change Password */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                <HiOutlineKey className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Change Your Password
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">
                  We recommend updating your password every few months, or if
                  you think someone else might know it.
                </p>
                <button
                  onClick={handleOpenPasswordModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Two-Step Verification */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <HiOutlineShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    Two-Step Verification
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Add an extra layer of security. When you sign in, we&apos;ll
                    send a code to your phone that you&apos;ll need to enter.
                  </p>
                </div>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={settings.twoStepVerification}
                  onToggle={() =>
                    update("twoStepVerification", !settings.twoStepVerification)
                  }
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─── 3. Job Preferences ─── */}
        <SectionCard
          title="Job Preferences"
          subtitle="Help us find jobs that match what you're looking for."
        >
          <div className="space-y-5">
            <SelectField
              label="Job-Seeking Status"
              hint="Let employers know your availability. This badge is shown on your profile."
              value={settings.jobSeekingStatus}
              onChange={(val) => update("jobSeekingStatus", val)}
              options={[
                {
                  value: "none",
                  label: "No status — don't show a badge on my profile",
                },
                {
                  value: "actively_looking",
                  label: "🟢 Actively Looking — ready for new opportunities",
                },
                {
                  value: "open_to_offers",
                  label:
                    "🔵 Open to Offers — not actively searching but interested",
                },
                {
                  value: "not_looking",
                  label: "⚫ Not Looking — not seeking opportunities right now",
                },
              ]}
            />

            <SelectField
              label="Preferred Work Type"
              hint="Choose how you'd prefer to work."
              value={settings.preferredWorkType}
              onChange={(val) => update("preferredWorkType", val)}
              options={[
                { value: "remote", label: "Remote (work from home)" },
                { value: "on-site", label: "On-site (in person)" },
                { value: "hybrid", label: "Hybrid (mix of both)" },
                { value: "no-preference", label: "No preference" },
              ]}
            />

            <SelectField
              label="Preferred Location"
              hint="Where are you willing to work or travel to?"
              value={settings.preferredLocation}
              onChange={(val) => update("preferredLocation", val)}
              options={[
                { value: "within-10", label: "Within 10 miles of my home" },
                { value: "within-25", label: "Within 25 miles of my home" },
                { value: "within-50", label: "Within 50 miles of my home" },
                { value: "anywhere", label: "Anywhere / Willing to relocate" },
              ]}
            />

            <SelectField
              label="Experience Level"
              hint="This helps match you with appropriate positions."
              value={settings.experienceLevel}
              onChange={(val) => update("experienceLevel", val)}
              options={[
                { value: "entry", label: "Entry Level (0–2 years)" },
                {
                  value: "mid",
                  label: "Mid Level (3–7 years)",
                },
                {
                  value: "senior",
                  label: "Senior Level (extensive experience)",
                },
                {
                  value: "executive",
                  label: "Executive / Leadership",
                },
              ]}
            />
          </div>
        </SectionCard>

        {/* ─── 4. Notifications ─── */}
        <SectionCard
          title="Notifications"
          subtitle="Choose which emails you'd like to receive from us."
        >
          <div className="space-y-5">
            {/* Email Notifications */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <HiOutlineEnvelope className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-gray-500">
                    Receive important updates about your account and
                    applications.
                  </p>
                </div>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={settings.emailNotifications}
                  onToggle={() =>
                    update("emailNotifications", !settings.emailNotifications)
                  }
                />
              </div>
            </div>

            {/* Job Alerts */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <HiOutlineBriefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                    Job Alerts
                  </h4>
                  <p className="text-sm text-gray-500">
                    Get notified when new jobs match your preferences.
                  </p>
                </div>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={settings.jobAlerts}
                  onToggle={() => update("jobAlerts", !settings.jobAlerts)}
                />
              </div>
            </div>

            {/* Community Updates */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <HiOutlineUserGroup className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                    Community Updates
                  </h4>
                  <p className="text-sm text-gray-500">
                    Stay informed about community events and discussions.
                  </p>
                </div>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={settings.communityUpdates}
                  onToggle={() =>
                    update("communityUpdates", !settings.communityUpdates)
                  }
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─── 5. Accessibility Preferences ─── */}
        <SectionCard
          title="Accessibility Preferences"
          subtitle="Customize how the platform looks and feels to make it easier for you to use."
        >
          <div className="space-y-6">
            {/* Text Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Text Size
              </label>
              <p className="text-xs text-gray-400 mb-4">
                Choose a text size that&apos;s comfortable for you to read.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    key: "normal" as TextSize,
                    label: "Normal",
                    previewSize: "text-[22px]",
                  },
                  {
                    key: "large" as TextSize,
                    label: "Large",
                    previewSize: "text-[30px]",
                  },
                  {
                    key: "extra-large" as TextSize,
                    label: "Extra Large",
                    previewSize: "text-[38px]",
                  },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setTextSize(opt.key)}
                    className={`flex flex-col items-center justify-center py-5 px-3 rounded-xl border-2 transition-colors cursor-pointer ${
                      textSize === opt.key
                        ? "border-primary bg-red-50/50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <span
                      className={`font-bold mb-1 leading-none ${
                        opt.previewSize
                      } ${
                        textSize === opt.key ? "text-primary" : "text-gray-700"
                      }`}
                    >
                      Aa
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <HiOutlineEyeSlash className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                    High Contrast Mode
                  </h4>
                  <p className="text-sm text-gray-500">
                    Makes text easier to read by increasing the contrast between
                    text and backgrounds.
                  </p>
                </div>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={highContrast}
                  onToggle={() => setHighContrast(!highContrast)}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─── 6. Privacy & Data ─── */}
        <SectionCard
          title="Privacy & Data"
          subtitle="Control who can see your profile and manage your personal data."
        >
          <div className="space-y-6">
            {/* Profile Visibility */}
            <SelectField
              label="Profile Visibility"
              hint="Choose who can see your profile information."
              value={settings.profileVisibility}
              onChange={(val) => update("profileVisibility", val)}
              options={[
                {
                  value: "everyone",
                  label: "Everyone - Anyone on the platform can see my profile",
                },
                {
                  value: "employers-only",
                  label:
                    "Employers Only - Only verified employers can see my profile",
                },
                {
                  value: "private",
                  label: "Private - Only I can see my profile",
                },
              ]}
            />

            {/* Download Data */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                <HiOutlineArrowDownTray className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Download Your Data
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">
                  Get a copy of all the information you&apos;ve shared with us.
                  This may take a few minutes to prepare.
                </p>
                <button
                  onClick={handleDataDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      Preparing...
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" />
                      Download Started
                    </>
                  ) : (
                    "Request Data Download"
                  )}
                </button>
              </div>
            </div>

            {/* Deactivate Account */}
            <div className="rounded-xl border border-red-100 bg-red-50/40 p-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    Deactivate Account
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">
                    If you no longer wish to use this platform, you can
                    deactivate your account. Your data will be saved for 30 days
                    in case you change your mind.
                  </p>
                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 font-semibold text-sm rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Deactivate My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ─── Change Password Modal ─── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={handleClosePasswordModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-[460px] w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <HiOutlineLockClosed className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Change Password
                  </h3>
                  <p className="text-xs text-gray-400">
                    Keep your account secure
                  </p>
                </div>
              </div>
              <button
                onClick={handleClosePasswordModal}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Success State */}
            {passwordSuccess ? (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCheckCircle className="w-7 h-7 text-emerald-500" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  Password Updated
                </h4>
                <p className="text-sm text-gray-500">
                  Your password has been changed successfully.
                </p>
              </div>
            ) : (
              <>
                {/* Body */}
                <div className="px-6 py-6 space-y-5">
                  {/* Error message */}
                  {passwordError && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
                      <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-sm text-red-600">{passwordError}</p>
                    </div>
                  )}

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="form-input pr-11"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showCurrentPassword ? (
                          <HiOutlineEyeSlash className="w-5 h-5" />
                        ) : (
                          <HiOutlineEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className="form-input pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showNewPassword ? (
                          <HiOutlineEyeSlash className="w-5 h-5" />
                        ) : (
                          <HiOutlineEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Requirements */}
                    {newPassword.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {passwordRequirements.map((req) => (
                          <div
                            key={req.label}
                            className="flex items-center gap-2"
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                req.met
                                  ? "bg-emerald-100 text-emerald-600"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              <svg
                                className="w-2.5 h-2.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.5 12.75l6 6 9-13.5"
                                />
                              </svg>
                            </div>
                            <span
                              className={`text-xs ${
                                req.met ? "text-emerald-600" : "text-gray-400"
                              }`}
                            >
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        className={`form-input pr-11 ${
                          confirmPassword.length > 0 && !passwordsMatch
                            ? "border-red-400 focus:border-red-400"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <HiOutlineEyeSlash className="w-5 h-5" />
                        ) : (
                          <HiOutlineEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-xs text-red-500 mt-1.5">
                        Passwords do not match.
                      </p>
                    )}
                    {passwordsMatch && (
                      <p className="text-xs text-emerald-500 mt-1.5 flex items-center gap-1">
                        <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                        Passwords match
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={handleClosePasswordModal}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={!canSubmitPassword || passwordSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                  >
                    {passwordSaving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Deactivate Account Modal ─── */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={handleCloseDeactivateModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-[460px] w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Deactivate Account
                  </h3>
                  <p className="text-xs text-gray-400">
                    This action cannot be easily undone
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDeactivateModal}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-5">
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <p className="text-sm text-red-700 leading-relaxed">
                  <strong>Warning:</strong> Deactivating your account will:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-red-600">
                  <li>• Remove your profile from employer searches</li>
                  <li>• Cancel all active job applications</li>
                  <li>• Delete your saved jobs and searches</li>
                </ul>
                <p className="text-sm text-red-600 mt-2">
                  Your data will be retained for 30 days, after which it will be
                  permanently deleted.
                </p>
              </div>

              {/* Error message */}
              {deactivateError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
                  <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{deactivateError}</p>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm your password
                </label>
                <div className="relative">
                  <input
                    type={showDeactivatePassword ? "text" : "password"}
                    value={deactivatePassword}
                    onChange={(e) => setDeactivatePassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="form-input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowDeactivatePassword(!showDeactivatePassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showDeactivatePassword ? (
                      <HiOutlineEyeSlash className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Type DEACTIVATE to confirm */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Type{" "}
                  <span className="text-red-600 font-bold">DEACTIVATE</span> to
                  confirm
                </label>
                <input
                  type="text"
                  value={deactivateConfirmText}
                  onChange={(e) => setDeactivateConfirmText(e.target.value)}
                  placeholder="DEACTIVATE"
                  className={`form-input ${
                    deactivateConfirmText.length > 0 &&
                    deactivateConfirmText !== "DEACTIVATE"
                      ? "border-red-400 focus:border-red-400"
                      : ""
                  }`}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={handleCloseDeactivateModal}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateAccount}
                disabled={
                  deactivateConfirmText !== "DEACTIVATE" ||
                  !deactivatePassword ||
                  isDeactivating
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
              >
                {isDeactivating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  "Deactivate Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

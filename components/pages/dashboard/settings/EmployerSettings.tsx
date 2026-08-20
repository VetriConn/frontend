"use client";

import React, { useState } from "react";
import {
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineEnvelope,
  HiOutlineBuildingOffice2,
  HiOutlineUserGroup,
  HiOutlineEyeSlash,
  HiOutlineEye,
  HiOutlineArrowDownTray,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBell,
  HiOutlineCreditCard,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import { useAccessibility, type TextSize } from "@/hooks/useAccessibility";
import { useToaster } from "@/components/ui/Toaster";
import { useUserProfile } from "@/hooks/useUserProfile";
import { RoleGuard } from "@/components/auth/RoleGuard";
import {
  changePassword as changePasswordApi,
  requestDataExport,
  deactivateAccount as deactivateAccountApi,
  updateUserSettings,
} from "@/lib/api";
import { Toggle, SectionCard, SelectField } from "@/components/ui/settings";
import TwoFactorSetupDialog from "@/components/security/TwoFactorSetupDialog";
import DisableTwoFactorDialog from "@/components/security/DisableTwoFactorDialog";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface EmployerSettingsState {
  // Company Preferences
  companySize: string;
  industry: string;
  hiringFrequency: string;
  publicCompanyProfile: boolean;
  showContactInformation: boolean;

  // Notifications
  emailNotifications: boolean;
  applicationAlerts: boolean;
  jobApprovedRejected: boolean;
  messages: boolean;
  platformUpdates: boolean;

  // Privacy
  companyProfileVisibility: string;
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function EmployerSettings() {
  // ─── Fetch user profile from DB ───────────────────────────────────────────
  const { userProfile, isLoading: profileLoading, mutateProfile } =
    useUserProfile();
  const { showToast } = useToaster();

  const [settings, setSettings] = useState<EmployerSettingsState>({
    companySize: userProfile?.employer_profile?.company_size || "1-10",
    industry: userProfile?.employer_profile?.industry || "technology",
    hiringFrequency: userProfile?.employer_profile?.hiring_frequency || "monthly",
    publicCompanyProfile: userProfile?.employer_profile?.company_preferences?.public_company_profile ?? true,
    showContactInformation: userProfile?.employer_profile?.company_preferences?.show_contact_information ?? true,

    emailNotifications: userProfile?.employer_profile?.notification_preferences?.email_notifications ?? true,
    applicationAlerts: userProfile?.employer_profile?.notification_preferences?.application_alerts ?? userProfile?.employer_profile?.notification_preferences?.new_applications ?? true,
    jobApprovedRejected: userProfile?.employer_profile?.notification_preferences?.job_approved_rejected ?? true,
    messages: userProfile?.employer_profile?.notification_preferences?.messages ?? true,
    platformUpdates: userProfile?.employer_profile?.notification_preferences?.platform_updates ?? false,

    companyProfileVisibility: userProfile?.employer_profile?.company_preferences?.company_profile_visibility || "public",
  });

  // Synchronize state with userProfile when fetched
  React.useEffect(() => {
    if (userProfile && userProfile.employer_profile) {
      const ep = userProfile.employer_profile;
      setSettings({
        companySize: ep.company_size || "1-10",
        industry: ep.industry || "technology",
        hiringFrequency: ep.hiring_frequency || "monthly",
        publicCompanyProfile: ep.company_preferences?.public_company_profile ?? true,
        showContactInformation: ep.company_preferences?.show_contact_information ?? true,
        emailNotifications: ep.notification_preferences?.email_notifications ?? true,
        applicationAlerts: ep.notification_preferences?.application_alerts ?? ep.notification_preferences?.new_applications ?? true,
        jobApprovedRejected: ep.notification_preferences?.job_approved_rejected ?? true,
        messages: ep.notification_preferences?.messages ?? true,
        platformUpdates: ep.notification_preferences?.platform_updates ?? false,
        companyProfileVisibility: ep.company_preferences?.company_profile_visibility || "public",
      });
    }
  }, [userProfile]);

  // ─── Two-step verification (derived from profile) ─────────────────────────
  const twoFactorEnabled = Boolean(userProfile?.two_factor_enabled);
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
  const [twoFactorDisableOpen, setTwoFactorDisableOpen] = useState(false);
  const handleTwoFactorToggle = () => {
    if (twoFactorEnabled) {
      setTwoFactorDisableOpen(true);
    } else {
      setTwoFactorSetupOpen(true);
    }
  };
  const handleTwoFactorChange = () => {
    mutateProfile();
  };

  const update = <K extends keyof EmployerSettingsState>(
    key: K,
    value: EmployerSettingsState[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Persist to backend (fire-and-forget but surface failures)
    updateUserSettings(newSettings).catch((error: unknown) => {
      showToast({
        type: "error",
        title: "Couldn't save your changes",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
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
      const response = await requestDataExport();
      showToast({
        type: "success",
        title: "Export requested",
        description: response.message || "Your data export is on its way to your email address.",
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Export failed",
        description: err.message || "Failed to export your data. Please try again.",
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
    <RoleGuard allowedRoles={["employer"]}>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-lato text-xl md:text-3xl font-bold text-gray-900 mb-1">
            Employer Settings
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Manage your company account preferences, security, and hiring
            settings.
          </p>
        </div>

        {/* ─── 1. Account Information (read-only) ─── */}
        <SectionCard
          title="Account Information"
          subtitle="Your sign-in email and company profile link."
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
                <label className="block text-sm font-semibold text-gray-900 mb-1.5 md:mb-2">
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

              {/* Link to company profile */}
              <a
                href="/dashboard/company-profile"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
              >
                <HiOutlineArrowTopRightOnSquare className="w-4 h-4 md:w-5 md:h-5" />
                Edit your company name, logo, and details on your Company
                Profile page
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
                    {twoFactorEnabled && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70">
                        On
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Pair an authenticator app like 1Password or Google
                    Authenticator. We&apos;ll ask for a 6-digit code each time
                    you sign in.
                  </p>
                </div>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={twoFactorEnabled}
                  onToggle={handleTwoFactorToggle}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─── 3. Hiring Profile ─── */}
        <SectionCard
          title="Hiring Profile"
          subtitle="Help us understand your hiring needs and company profile."
        >
          <div className="space-y-5">
            <SelectField
              label="Company Size"
              hint="How many employees does your company have?"
              value={settings.companySize}
              onChange={(val) => update("companySize", val)}
              options={[
                { value: "1-10", label: "1-10 employees" },
                { value: "11-50", label: "11-50 employees" },
                { value: "51-200", label: "51-200 employees" },
                { value: "201-500", label: "201-500 employees" },
                { value: "501-1000", label: "501-1000 employees" },
                { value: "1000+", label: "1000+ employees" },
              ]}
            />

            <SelectField
              label="Industry"
              hint="What industry does your company operate in?"
              value={settings.industry}
              onChange={(val) => update("industry", val)}
              options={[
                { value: "technology", label: "Technology" },
                { value: "healthcare", label: "Healthcare" },
                { value: "finance", label: "Finance" },
                { value: "retail", label: "Retail" },
                { value: "manufacturing", label: "Manufacturing" },
                { value: "education", label: "Education" },
                { value: "hospitality", label: "Hospitality" },
                { value: "construction", label: "Construction" },
                { value: "other", label: "Other" },
              ]}
            />

            <SelectField
              label="Hiring Frequency"
              hint="How often do you typically post new job openings?"
              value={settings.hiringFrequency}
              onChange={(val) => update("hiringFrequency", val)}
              options={[
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
                { value: "annually", label: "Annually" },
                { value: "as-needed", label: "As needed" },
              ]}
            />
          </div>
        </SectionCard>

        {/* ─── 4. Company Preferences ─── */}
        <SectionCard
          title="Company Preferences"
          subtitle="Manage how your company is presented to job seekers."
        >
          <div className="space-y-6">
            {/* Public Company Profile */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                  Public Company Profile
                </h4>
                <p className="text-sm text-gray-500">
                  Allow job seekers to view your company page
                </p>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={settings.publicCompanyProfile}
                  onToggle={() =>
                    update(
                      "publicCompanyProfile",
                      !settings.publicCompanyProfile,
                    )
                  }
                />
              </div>
            </div>

            {/* Show Contact Information */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                  Show Contact Information
                </h4>
                <p className="text-sm text-gray-500">
                  Display email and phone on your profile
                </p>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={settings.showContactInformation}
                  onToggle={() =>
                    update(
                      "showContactInformation",
                      !settings.showContactInformation,
                    )
                  }
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─── 5. Notification Preferences ─── */}
        <SectionCard
          title="Notification Preferences"
          subtitle="Choose which emails and alerts you'd like to receive."
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
                    Receive important updates about your account and job
                    postings.
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

            {/* Application Alerts */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <HiOutlineBell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                    Application Alerts
                  </h4>
                  <p className="text-sm text-gray-500">
                    Get notified when candidates apply to your job postings.
                  </p>
                </div>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={settings.applicationAlerts}
                  onToggle={() =>
                    update("applicationAlerts", !settings.applicationAlerts)
                  }
                />
              </div>
            </div>

            {/* Job Approved/Rejected */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <HiOutlineClipboardDocumentCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                    Job Approved/Rejected
                  </h4>
                  <p className="text-sm text-gray-500">
                    Get notified when your job postings are reviewed and their
                    status changes.
                  </p>
                </div>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={settings.jobApprovedRejected}
                  onToggle={() =>
                    update("jobApprovedRejected", !settings.jobApprovedRejected)
                  }
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                    Messages
                  </h4>
                  <p className="text-sm text-gray-500">
                    Get notified when you receive a new message from a
                    candidate.
                  </p>
                </div>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={settings.messages}
                  onToggle={() => update("messages", !settings.messages)}
                />
              </div>
            </div>

            {/* Platform Updates */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <HiOutlineUserGroup className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                    Platform Updates
                  </h4>
                  <p className="text-sm text-gray-500">
                    Stay informed about new features and platform improvements.
                  </p>
                </div>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  enabled={settings.platformUpdates}
                  onToggle={() =>
                    update("platformUpdates", !settings.platformUpdates)
                  }
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─── 6. Accessibility Preferences ─── */}
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
                Choose a text size that's comfortable for you to read.
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

        {/* ─── 7. Privacy & Data ─── */}
        <SectionCard
          title="Privacy & Data"
          subtitle="Control your company profile visibility and manage your data."
        >
          <div className="space-y-6">
            {/* Company Profile Visibility */}
            <SelectField
              label="Company Profile Visibility"
              hint="Choose who can see your company profile and job postings."
              value={settings.companyProfileVisibility}
              onChange={(val) => update("companyProfileVisibility", val)}
              options={[
                {
                  value: "public",
                  label:
                    "Public - Anyone can see your company profile and jobs",
                },
                {
                  value: "registered-only",
                  label:
                    "Registered Users Only - Only logged-in users can see your profile",
                },
                {
                  value: "private",
                  label: "Private - Only you can see your company profile",
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
                  Get a copy of all the information you've shared with us,
                  including job postings and applicant data.
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

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={handleClosePasswordModal}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h3 className="font-lato text-lg font-bold text-gray-900">
                  Change Password
                </h3>
                <button
                  onClick={handleClosePasswordModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <HiOutlineXMark className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {passwordSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                      <HiOutlineCheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h4 className="font-lato text-lg font-bold text-gray-900 mb-2">
                      Password Changed!
                    </h4>
                    <p className="text-sm text-gray-500 text-center">
                      Your password has been updated successfully.
                    </p>
                  </div>
                ) : (
                  <>
                    {passwordError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{passwordError}</p>
                      </div>
                    )}

                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="form-input pr-12"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="form-input pr-12"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        <ul className="mt-3 space-y-1.5">
                          {passwordRequirements.map((req, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-xs"
                            >
                              {req.met ? (
                                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                              )}
                              <span
                                className={
                                  req.met ? "text-emerald-700" : "text-gray-500"
                                }
                              >
                                {req.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="form-input pr-12"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <HiOutlineEyeSlash className="w-5 h-5" />
                          ) : (
                            <HiOutlineEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Password Match Indicator */}
                      {confirmPassword.length > 0 && (
                        <p
                          className={`mt-2 text-xs flex items-center gap-1.5 ${
                            passwordsMatch ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          {passwordsMatch ? (
                            <>
                              <HiOutlineCheckCircle className="w-4 h-4" />
                              Passwords match
                            </>
                          ) : (
                            <>
                              <HiOutlineExclamationTriangle className="w-4 h-4" />
                              Passwords do not match
                            </>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleChangePassword}
                      disabled={!canSubmitPassword || passwordSaving}
                      className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordSaving
                        ? "Changing Password..."
                        : "Change Password"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deactivate Account Modal */}
        {showDeactivateModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={handleCloseDeactivateModal}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h3 className="font-lato text-lg font-bold text-gray-900">
                  Deactivate Account
                </h3>
                <button
                  onClick={handleCloseDeactivateModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <HiOutlineXMark className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Warning */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <HiOutlineExclamationTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">
                        This action is serious
                      </h4>
                      <p className="text-sm text-red-700 leading-relaxed">
                        Deactivating your account will:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-red-700">
                        <li>
                          • Remove your company profile from job seeker searches
                        </li>
                        <li>• Unpublish all active job postings</li>
                        <li>• Delete pending applications</li>
                        <li>• Remove access to applicant data</li>
                      </ul>
                      <p className="text-sm text-red-700 mt-3">
                        Your data will be saved for 30 days in case you change
                        your mind. After that, it will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>

                {deactivateError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{deactivateError}</p>
                  </div>
                )}

                {/* Password Confirmation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Enter Your Password
                  </label>
                  <div className="relative">
                    <input
                      type={showDeactivatePassword ? "text" : "password"}
                      value={deactivatePassword}
                      onChange={(e) => setDeactivatePassword(e.target.value)}
                      className="form-input pr-12"
                      placeholder="Enter your password to confirm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowDeactivatePassword(!showDeactivatePassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showDeactivatePassword ? (
                        <HiOutlineEyeSlash className="w-5 h-5" />
                      ) : (
                        <HiOutlineEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Type DEACTIVATE Confirmation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Type <span className="text-red-600">DEACTIVATE</span> to
                    confirm
                  </label>
                  <input
                    type="text"
                    value={deactivateConfirmText}
                    onChange={(e) =>
                      setDeactivateConfirmText(e.target.value.toUpperCase())
                    }
                    className="form-input"
                    placeholder="Type DEACTIVATE"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseDeactivateModal}
                    disabled={isDeactivating}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeactivating ? "Deactivating..." : "Deactivate Account"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two-Factor dialogs */}
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
    </RoleGuard>
  );
}

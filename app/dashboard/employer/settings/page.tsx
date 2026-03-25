"use client";

import { useEffect, useState } from "react";
import { changePassword } from "@/lib/api";
import { usePatchProfile } from "@/hooks/usePatchProfile";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToaster } from "@/components/ui/Toaster";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AccountInfo {
  fullName: string;
  email: string;
  role: string;
}

interface PasswordFields {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationPrefs {
  emailNotifications: boolean;
  jobApprovedRejected: boolean;
  newApplications: boolean;
  messages: boolean;
}

interface CompanyPrefs {
  publicProfile: boolean;
  showContactInfo: boolean;
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────

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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
        enabled ? "bg-primary" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Shared Styles ───────────────────────────────────────────────────────────

const inputClasses =
  "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white";

const labelClasses = "block text-sm font-semibold text-gray-900 mb-1.5";

const sectionClasses = "bg-white rounded-xl border border-gray-200 p-6";

// ─── Page Component ──────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { userProfile } = useUserProfile();
  const { patchProfile } = usePatchProfile();
  const { showToast } = useToaster();

  const [account, setAccount] = useState<AccountInfo>({
    fullName: "",
    email: "",
    role: "Employer",
  });

  const [passwords, setPasswords] = useState<PasswordFields>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    emailNotifications: true,
    jobApprovedRejected: true,
    newApplications: true,
    messages: true,
  });

  const [companyPrefs, setCompanyPrefs] = useState<CompanyPrefs>({
    publicProfile: true,
    showContactInfo: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    setAccount({
      fullName: userProfile.full_name || "",
      email: userProfile.email || "",
      role: userProfile.role === "employer" ? "Employer" : "Job Seeker",
    });
  }, [userProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await patchProfile({
        full_name: account.fullName,
        email: account.email,
      });

      if (
        passwords.currentPassword ||
        passwords.newPassword ||
        passwords.confirmPassword
      ) {
        if (!passwords.currentPassword || !passwords.newPassword) {
          throw new Error("Current and new password are required");
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
          throw new Error("New password and confirmation do not match");
        }

        await changePassword(passwords.currentPassword, passwords.newPassword);
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      showToast({
        type: "success",
        title: "Settings saved",
        description: "Your changes were saved successfully",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Save failed",
        description:
          err instanceof Error ? err.message : "Could not save settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = (key: keyof NotificationPrefs) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCompanyPref = (key: keyof CompanyPrefs) => {
    setCompanyPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-6 py-8" style={{maxWidth: '600px'}}>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="space-y-5">
          {/* ── Account Information ── */}
          <section className={sectionClasses}>
            <h2 className="text-base font-bold text-gray-900 mb-5">
              Account Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Full Name</label>
                <input
                  type="text"
                  value={account.fullName}
                  onChange={(e) =>
                    setAccount((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Email Address</label>
                <input
                  type="email"
                  value={account.email}
                  onChange={(e) =>
                    setAccount((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Role</label>
                <input
                  type="text"
                  value={account.role}
                  disabled
                  className={`${inputClasses} bg-gray-50 text-gray-400 cursor-not-allowed`}
                />
              </div>
            </div>
          </section>

          {/* ── Password & Security ── */}
          <section className={sectionClasses}>
            <h2 className="text-base font-bold text-gray-900 mb-5">
              Password &amp; Security
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Current Password</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>New Password</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className={inputClasses}
                />
              </div>
            </div>
          </section>

          {/* ── Notification Preferences ── */}
          <section className={sectionClasses}>
            <h2 className="text-base font-bold text-gray-900 mb-5">
              Notification Preferences
            </h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Email Notifications
                  </p>
                  <p className="text-xs text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <Toggle
                  enabled={notifications.emailNotifications}
                  onToggle={() => toggleNotification("emailNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Job Approved/Rejected
                  </p>
                  <p className="text-xs text-gray-400">
                    When your job posting status changes
                  </p>
                </div>
                <Toggle
                  enabled={notifications.jobApprovedRejected}
                  onToggle={() => toggleNotification("jobApprovedRejected")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    New Applications
                  </p>
                  <p className="text-xs text-gray-400">
                    When someone applies to your jobs
                  </p>
                </div>
                <Toggle
                  enabled={notifications.newApplications}
                  onToggle={() => toggleNotification("newApplications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Messages
                  </p>
                  <p className="text-xs text-gray-400">
                    When you receive a new message
                  </p>
                </div>
                <Toggle
                  enabled={notifications.messages}
                  onToggle={() => toggleNotification("messages")}
                />
              </div>
            </div>
          </section>

          {/* ── Company Preferences ── */}
          <section className={sectionClasses}>
            <h2 className="text-base font-bold text-gray-900 mb-5">
              Company Preferences
            </h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Public Company Profile
                  </p>
                  <p className="text-xs text-gray-400">
                    Allow job seekers to view your company page
                  </p>
                </div>
                <Toggle
                  enabled={companyPrefs.publicProfile}
                  onToggle={() => toggleCompanyPref("publicProfile")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Show Contact Information
                  </p>
                  <p className="text-xs text-gray-400">
                    Display email and phone on your profile
                  </p>
                </div>
                <Toggle
                  enabled={companyPrefs.showContactInfo}
                  onToggle={() => toggleCompanyPref("showContactInfo")}
                />
              </div>
            </div>
          </section>

          {/* ── Save Button ── */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

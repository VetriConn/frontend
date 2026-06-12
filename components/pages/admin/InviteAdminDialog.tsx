"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { HiOutlineUserPlus } from "react-icons/hi2";
import type { AdminMemberRole } from "@/hooks/useAdminTeam";

interface InviteAdminDialogProps {
  open: boolean;
  busy: boolean;
  /** Only super admins may invite other super admins. */
  canInviteSuperAdmin: boolean;
  onClose: () => void;
  onConfirm: (email: string, role: AdminMemberRole) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InviteAdminDialog = ({
  open,
  busy,
  canInviteSuperAdmin,
  onClose,
  onConfirm,
}: InviteAdminDialogProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminMemberRole>("admin");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("admin");
    }
  }, [open]);

  if (!open) return null;

  const valid = EMAIL_RE.test(email.trim());

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 flex items-center justify-center shrink-0">
            <HiOutlineUserPlus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900">
              Invite an admin
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              They&apos;ll get an email with a one-time link to join.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@vetriconn.com"
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <fieldset>
            <legend className="text-xs font-semibold text-gray-700">
              Role
            </legend>
            <div className="mt-1.5 grid grid-cols-1 gap-2">
              <RoleOption
                selected={role === "admin"}
                onSelect={() => setRole("admin")}
                title="Admin"
                description="Moderates jobs, employers, users, and tickets."
              />
              <RoleOption
                selected={role === "super_admin"}
                onSelect={() => setRole("super_admin")}
                disabled={!canInviteSuperAdmin}
                title="Super Admin"
                description={
                  canInviteSuperAdmin
                    ? "All admin powers, plus team management and audit log access."
                    : "Only existing super admins can grant this role."
                }
              />
            </div>
          </fieldset>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(email.trim(), role)}
            disabled={busy || !valid}
            className="inline-flex items-center gap-2 bg-primary text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Sending…" : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
};

const RoleOption = ({
  selected,
  onSelect,
  title,
  description,
  disabled,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={disabled}
    className={clsx(
      "text-left px-3.5 py-3 rounded-xl border transition-colors",
      disabled
        ? "border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-60"
        : selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/15"
          : "border-gray-200 hover:border-gray-300",
    )}
  >
    <p className="text-sm font-semibold text-gray-900">{title}</p>
    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
  </button>
);

export default InviteAdminDialog;

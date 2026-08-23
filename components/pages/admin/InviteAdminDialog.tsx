"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { HiOutlineUserPlus } from "react-icons/hi2";
import {
  ADMIN_ROLES,
  ROLE_LABEL,
  ROLE_DESCRIPTION,
  type AdminMemberRole,
} from "@/hooks/useAdminTeam";
import type { AdminStepUp } from "@/lib/api/admin";

interface InviteAdminDialogProps {
  open: boolean;
  busy: boolean;
  /** Only super admins may invite other super admins. */
  canInviteSuperAdmin: boolean;
  onClose: () => void;
  onConfirm: (
    email: string,
    fullName: string,
    role: AdminMemberRole,
    creds: AdminStepUp,
  ) => void;
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
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AdminMemberRole>("reviewer");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setFullName("");
      setRole("reviewer");
      setPassword("");
      setTotp("");
    }
  }, [open]);

  if (!open) return null;

  const valid =
    EMAIL_RE.test(email.trim()) &&
    fullName.trim().length > 0 &&
    password.length > 0;

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

        <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">
              Full name
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jordan Lee"
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

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
            <legend className="text-xs font-semibold text-gray-700">Role</legend>
            <div className="mt-1.5 grid grid-cols-1 gap-2">
              {ADMIN_ROLES.map((r) => {
                const locked = r === "super_admin" && !canInviteSuperAdmin;
                return (
                  <RoleOption
                    key={r}
                    selected={role === r}
                    onSelect={() => setRole(r)}
                    disabled={locked}
                    title={ROLE_LABEL[r]}
                    description={
                      locked
                        ? "Only existing super admins can grant this role."
                        : ROLE_DESCRIPTION[r]
                    }
                  />
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-3 pt-1 border-t border-gray-100">
            <p className="text-[11px] text-gray-500 pt-3">
              Confirm it&apos;s you to send an admin invite.
            </p>
            <label className="block">
              <span className="text-xs font-semibold text-gray-700">
                Your password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-700">
                Authentication code{" "}
                <span className="font-normal text-gray-400">(if 2FA is on)</span>
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={totp}
                onChange={(e) => setTotp(e.target.value)}
                placeholder="123456"
                autoComplete="one-time-code"
                className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 tracking-widest"
              />
            </label>
          </div>
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
            onClick={() =>
              onConfirm(email.trim(), fullName.trim(), role, {
                password,
                totp_code: totp.trim() || undefined,
              })
            }
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

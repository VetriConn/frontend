"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import {
  ADMIN_ROLES,
  ROLE_LABEL,
  ROLE_DESCRIPTION,
  type AdminMemberRole,
} from "@/hooks/useAdminTeam";
import type { AdminStepUp } from "@/lib/api/admin";

interface ChangeAdminRoleDialogProps {
  open: boolean;
  busy: boolean;
  memberName: string;
  currentRole: AdminMemberRole;
  /** Roles the caller isn't allowed to move this member to (e.g. demoting the
   *  last super admin). Rendered disabled. */
  lockedRoles?: AdminMemberRole[];
  onClose: () => void;
  onConfirm: (role: AdminMemberRole, creds: AdminStepUp) => void;
}

/**
 * Change an admin's tier. Combines the role picker with the step-up prompt
 * (ADM-5) the backend requires for role changes, so the action lands in one
 * confirmed submission rather than a role edit that then 403s.
 */
const ChangeAdminRoleDialog = ({
  open,
  busy,
  memberName,
  currentRole,
  lockedRoles = [],
  onClose,
  onConfirm,
}: ChangeAdminRoleDialogProps) => {
  const [role, setRole] = useState<AdminMemberRole>(currentRole);
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");

  useEffect(() => {
    if (open) {
      setRole(currentRole);
      setPassword("");
      setTotp("");
    }
  }, [open, currentRole]);

  if (!open) return null;

  const changed = role !== currentRole;
  const canSubmit = changed && password.length > 0 && !busy;

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
            <HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900">Change role</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{memberName}</p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <fieldset>
            <legend className="text-xs font-semibold text-gray-700">Role</legend>
            <div className="mt-1.5 grid grid-cols-1 gap-2">
              {ADMIN_ROLES.map((r) => {
                const locked = lockedRoles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => !locked && setRole(r)}
                    disabled={locked}
                    className={clsx(
                      "text-left px-3.5 py-3 rounded-xl border transition-colors",
                      locked
                        ? "border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-60"
                        : role === r
                          ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                          : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {ROLE_LABEL[r]}
                      {r === currentRole && (
                        <span className="ml-1.5 text-[11px] font-medium text-gray-400">
                          (current)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ROLE_DESCRIPTION[r]}
                    </p>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-3 pt-1 border-t border-gray-100">
            <p className="text-[11px] text-gray-500 pt-3">
              Confirm it&apos;s you to change access.
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
              onConfirm(role, { password, totp_code: totp.trim() || undefined })
            }
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Saving…" : "Update role"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeAdminRoleDialog;

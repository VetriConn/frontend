"use client";

import { useUserProfile } from "@/hooks/useUserProfile";

/**
 * The credential pair every step-up form collects, as controlled state the
 * owning dialog holds and resets on open/close.
 */
export interface StepUpFieldsValue {
  password: string;
  totp: string;
}

export const EMPTY_STEP_UP: StepUpFieldsValue = { password: "", totp: "" };

/** The shape the step-up API calls expect, from the fields' value. */
export function toStepUpCreds(value: StepUpFieldsValue): {
  password: string;
  totp_code?: string;
} {
  return {
    password: value.password,
    totp_code: value.totp.trim() || undefined,
  };
}

/**
 * Password + (when the admin has 2FA) TOTP inputs for high-risk actions
 * (ADM-5). This pair used to be rewritten inside every dialog that needed
 * step-up, three copies drifting apart; the dialogs now share this one.
 *
 * The profile already knows whether this admin has 2FA — asking "if 2FA is
 * on" made them verify something we can check ourselves.
 */
const StepUpFields = ({
  value,
  onChange,
  note,
}: {
  value: StepUpFieldsValue;
  onChange: (next: StepUpFieldsValue) => void;
  /** One-line explanation above the fields (e.g. "Confirm it's you…"). */
  note?: string;
}) => {
  const { userProfile } = useUserProfile();
  const twoFactorOn = !!userProfile?.two_factor_enabled;

  return (
    <div className="space-y-3">
      {note && <p className="text-[0.6875rem] text-gray-500">{note}</p>}
      <label className="block">
        <span className="text-xs font-semibold text-gray-700">
          Your password
        </span>
        <input
          type="password"
          value={value.password}
          onChange={(e) => onChange({ ...value, password: e.target.value })}
          autoComplete="current-password"
          className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </label>
      {twoFactorOn && (
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">
            Authentication code
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={value.totp}
            onChange={(e) => onChange({ ...value, totp: e.target.value })}
            placeholder="123456"
            required
            autoComplete="one-time-code"
            className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 tracking-widest"
          />
        </label>
      )}
    </div>
  );
};

export default StepUpFields;

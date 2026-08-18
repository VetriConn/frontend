"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  HiOutlineUserPlus,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import {
  inviteMember,
  removeMember,
  type Company,
  type CompanyMember,
  type CompanyRole,
} from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import { FormField } from "@/components/ui/FormField";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

/**
 * Hiring-team management for a company.
 *
 * Permissions mirror the server: owners and admins can invite, only the owner
 * can remove, and the owner can never be removed. Actions the viewer can't
 * take are hidden rather than shown-and-rejected.
 */

interface CompanyTeamProps {
  company: Company;
  myRole: CompanyRole | null;
  /** Used to label the viewer's own row, since the API returns ids, not names. */
  myUserId?: string;
  onChanged: () => void;
}

const ROLE_OPTIONS = [
  { value: "recruiter", label: "Recruiter — review applicants" },
  { value: "admin", label: "Admin — manage jobs and teammates" },
];

const ROLE_LABEL: Record<CompanyRole, string> = {
  owner: "Owner",
  admin: "Admin",
  recruiter: "Recruiter",
};

const memberKey = (member: CompanyMember, index: number) =>
  member.user_id || member.invited_email || `member-${index}`;

export const CompanyTeam = ({
  company,
  myRole,
  myUserId,
  onChanged,
}: CompanyTeamProps) => {
  const { showToast } = useToaster();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("recruiter");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const canInvite = myRole === "owner" || myRole === "admin";
  const canRemove = myRole === "owner";

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setInviteError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setInviteError("Enter a valid email address");
      return;
    }

    setIsInviting(true);
    try {
      await inviteMember(
        company._id,
        email.trim(),
        role as Exclude<CompanyRole, "owner">,
      );
      showToast({
        type: "success",
        title: "Invite sent",
        description: `${email.trim()} has seven days to accept.`,
      });
      setEmail("");
      setRole("recruiter");
      setInviteOpen(false);
      onChanged();
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "We couldn't send that invite.",
      );
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (member: CompanyMember) => {
    if (!member.user_id) return;

    setRemovingId(member.user_id);
    try {
      await removeMember(company._id, member.user_id);
      showToast({
        type: "success",
        title: "Teammate removed",
        description: "They no longer have access to this company.",
      });
      onChanged();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't remove teammate",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h2 className="text-lg font-semibold text-gray-900">Hiring team</h2>
        {canInvite && !inviteOpen && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 py-2 px-3.5 bg-primary hover:bg-primary-hover text-white font-medium text-sm rounded-lg transition-colors"
          >
            <HiOutlineUserPlus className="w-4 h-4" />
            Invite teammate
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Teammates manage this company&apos;s jobs and applicants with their own
        accounts — nobody needs to share a password.
      </p>

      {inviteOpen && (
        <form
          onSubmit={handleInvite}
          className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5"
          noValidate
        >
          <FormField
            label="Email address"
            name="invite_email"
            type="email"
            value={email}
            onChange={setEmail}
            error={inviteError ?? undefined}
            placeholder="teammate@company.com"
            required
          />

          <div className="mb-4">
            <CustomDropdown
              label="Role"
              name="invite_role"
              placeholder="Select a role"
              value={role}
              onChange={setRole}
              options={ROLE_OPTIONS}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isInviting}
              className="py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors"
            >
              {isInviting ? "Sending…" : "Send invite"}
            </button>
            <button
              type="button"
              onClick={() => {
                setInviteOpen(false);
                setInviteError(null);
              }}
              className="py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="flex flex-col divide-y divide-gray-100">
        {company.members?.map((member, index) => {
          const isInvited = member.status === "invited";
          const isOwner = member.role === "owner";

          return (
            <li
              key={memberKey(member, index)}
              className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                {/* Members who joined by invite keep their invited_email, but
                    the owner never had one and the API returns ids rather than
                    names — so an unlabelled row would show a raw ObjectId. */}
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.invited_email ||
                    (member.user_id && member.user_id === myUserId
                      ? "You"
                      : member.role === "owner"
                        ? "Company owner"
                        : "Teammate")}
                </p>
                <p className="text-xs text-gray-500">
                  {ROLE_LABEL[member.role]}
                </p>
              </div>

              <span
                className={clsx(
                  "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                  isInvited
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70",
                )}
              >
                {isInvited ? (
                  <>
                    <HiOutlineClock className="w-3.5 h-3.5" />
                    Invite pending
                  </>
                ) : (
                  <>
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    Active
                  </>
                )}
              </span>

              {canRemove && !isOwner && member.user_id && (
                <button
                  type="button"
                  onClick={() => handleRemove(member)}
                  disabled={removingId === member.user_id}
                  aria-label={`Remove ${member.invited_email || "teammate"}`}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {!company.members?.length && (
        <p className="text-sm text-gray-500 py-4">
          No teammates yet. Invite someone to help review applicants.
        </p>
      )}
    </section>
  );
};

export default CompanyTeam;

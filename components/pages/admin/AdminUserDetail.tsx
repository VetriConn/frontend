"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineEnvelope,
} from "react-icons/hi2";
import {
  useAdminMemberDetail,
  suspendAdminUser,
  reinstateAdminUser,
} from "@/hooks/useAdminUsers";
import type {
  AdminMemberCountsDetail,
  AdminMemberProfile,
  AdminMemberSignIn,
} from "@/lib/api/admin";
import {
  AdminPageHeader,
  AdminBackLink,
  AdminNotFound,
  AdminTable,
  AdminTableHead,
  AdminTableTh,
  AdminTableBody,
  AdminTableRow,
  AdminTableTd,
  StatusPill,
} from "./AdminTablePanel";
import ConfirmDialog from "./ConfirmDialog";
import { userStandingConfirm } from "./confirmCopy";
import { useToaster } from "@/components/ui/Toaster";
import { formatDate, formatDateTime } from "@/lib/date-utils";
import { describeAgent } from "@/lib/user-agent";
import { ADMIN_PANEL_SURFACE } from "@/components/ui/panelStyles";

interface Props {
  userId: string;
}

/**
 * What an admin can see about a member, and what it deliberately stops short
 * of.
 *
 * The data export registry is the inventory of everything the platform holds
 * about a person. This is the subset that helps somebody answer a support
 * question: is this the right person, can I reach them, is the account real,
 * why can they not sign in, why are they getting these emails.
 *
 * Messages and community posts appear as counts and never as content. An
 * agent does not need to read a person's correspondence to do the job, and a
 * screen that puts it one click away is how it ends up being read. Reading a
 * thread stays behind the moderation flows, which leave an audit row saying
 * who looked.
 *
 * The "what you hold in your own right" rule governs a member's own export,
 * not this view, so an admin legitimately sees more here than the member's
 * archive would show a colleague. More is not everything.
 */

/** CompanyDetail's Field, which is the pattern this surface already uses. */
const Field = ({
  label,
  value,
  href,
}: {
  label: string;
  value?: React.ReactNode;
  href?: string;
}) => (
  <div>
    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
    </dt>
    <dd className="mt-1 text-sm text-gray-900 break-words">
      {href ? (
        <a href={href} className="text-primary hover:underline break-all">
          {value}
        </a>
      ) : value || value === 0 ? (
        value
      ) : (
        <span className="text-gray-400">Not provided</span>
      )}
    </dd>
  </div>
);

const Section = ({
  icon: Icon,
  title,
  description,
  aside,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section
    className={`${ADMIN_PANEL_SURFACE} shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 md:p-6`}
  >
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {aside}
    </div>
    {children}
  </section>
);

const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
    {children}
  </dl>
);

const yesNo = (value?: boolean) => (value ? "Yes" : "No");

/**
 * Each count links to the list it counts, so the number is a starting point
 * rather than a dead end. Where no admin list exists for a thing yet, the
 * tile stays a number: a link to a page that does not exist is worse than no
 * link.
 */
const COUNT_TILES: {
  key: keyof AdminMemberCountsDetail;
  label: string;
  /**
   * The list this count belongs to. Not per-member: none of these pages
   * filters by user, so the link opens the whole queue and the reader
   * narrows it. It took a `userId` it discarded, which promised a filtered
   * deep link that does not exist.
   */
  href?: string;
}[] = [
  { key: "applications", label: "Applications sent" },
  { key: "applications_received", label: "Applications received" },
  { key: "postings", label: "Jobs posted", href: "/admin/jobs" },
  { key: "companies", label: "Companies", href: "/admin/companies" },
  { key: "drafts", label: "Application drafts" },
  { key: "tracker_entries", label: "Tracker entries" },
  { key: "saved_jobs", label: "Saved jobs" },
  { key: "saved_searches", label: "Saved searches" },
  { key: "messages", label: "Messages" },
  { key: "community_posts", label: "Community posts" },
  { key: "reports_filed", label: "Reports filed", href: "/admin/reports" },
  { key: "support_tickets", label: "Support tickets", href: "/admin/support" },
];

/**
 * The four values User.status actually takes, and what each one means for the
 * one action this page offers.
 *
 * Read as a boolean this page said "Active" for a member who had closed their
 * own account and offered to Reinstate them, which would have undone the
 * closure. Suspension is the only standing this screen lifts: "deactivated"
 * is the member's own decision, and "pending" is an unverified email, neither
 * of which is a moderation outcome.
 */
const STANDING: Record<
  string,
  { label: string; tone: "emerald" | "rose" | "amber" | "gray"; action?: "suspend" | "reinstate" }
> = {
  active: { label: "Active", tone: "emerald", action: "suspend" },
  suspended: { label: "Suspended", tone: "rose", action: "reinstate" },
  pending: { label: "Pending verification", tone: "amber", action: "suspend" },
  deactivated: { label: "Deactivated", tone: "gray" },
};

const standingOf = (status?: string) =>
  STANDING[status ?? ""] ?? { label: status ?? "Unknown", tone: "gray" as const };

type NotificationPrefs = NonNullable<
  NonNullable<AdminMemberProfile["notification_preferences"]>
>;

/** Every switch in the member's one notification set, in the schema's order. */
const NOTIFICATION_FIELDS: { key: keyof NotificationPrefs; label: string }[] = [
  { key: "email_notifications", label: "Email notifications" },
  { key: "job_alerts", label: "Job alerts" },
  { key: "application_updates", label: "Application updates" },
  { key: "posting_updates", label: "Posting updates" },
  { key: "new_applications", label: "New applications" },
  { key: "messages", label: "Message emails" },
  { key: "community_updates", label: "Community updates" },
];

/**
 * Labels for both tables on this page: the sign-in history and the moderation
 * list below Standing. No rate-limit entry, because the limiter runs before
 * anything has authenticated and its rows carry no user, so the server cannot
 * return one however it is labelled here.
 */
const EVENT_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Signed in",
  LOGIN_FAILURE: "Failed sign in",
  LOGOUT: "Signed out",
  PASSWORD_CHANGE: "Password changed",
  PASSWORD_RESET_COMPLETE: "Password reset",
  EMAIL_CHANGED: "Email changed",
  USER_SUSPENDED: "Suspended",
  USER_REINSTATED: "Reinstated",
};

const eventLabel = (eventType: string) =>
  EVENT_LABELS[eventType] ??
  eventType
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());

const SignInRow = ({ event }: { event: AdminMemberSignIn }) => {
  // Colour rather than a pill. The label already reads "Failed sign in", and
  // a "Failed" badge next to it says the same word twice.
  const failed = /FAILURE|RATE_LIMIT/.test(event.eventType);
  return (
    <AdminTableRow>
      {/* nowrap so a narrow screen scrolls the table sideways, which is what
          the overflow wrapper is for. Left to wrap, "Sep 10, 2026, 08:56 AM"
          breaks across four lines and the column stops being readable. */}
      <AdminTableTd className="whitespace-nowrap">
        <span className="tabular-nums text-gray-500">
          {formatDateTime(event.timestamp)}
        </span>
      </AdminTableTd>
      <AdminTableTd className="whitespace-nowrap">
        <span
          className={`font-medium ${failed ? "text-rose-600" : "text-gray-900"}`}
        >
          {eventLabel(event.eventType)}
        </span>
      </AdminTableTd>
      <AdminTableTd>
        <span className="tabular-nums text-gray-500">
          {event.ipAddress || "Unknown"}
        </span>
      </AdminTableTd>
      <AdminTableTd className="whitespace-nowrap">
        {describeAgent(event.userAgent) || "Unknown"}
      </AdminTableTd>
    </AdminTableRow>
  );
};

const AdminUserDetail = ({ userId }: Props) => {
  const { member, isLoading, mutate } = useAdminMemberDetail(userId);
  const { showToast } = useToaster();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const standing = standingOf(member?.status);
  const isSuspending = standing.action === "suspend";

  const handleConfirm = async (reason?: string) => {
    if (!member) return;
    setBusy(true);
    try {
      if (isSuspending) {
        await suspendAdminUser(member._id, reason ?? "");
        showToast({ type: "success", title: "User suspended" });
      } else {
        await reinstateAdminUser(member._id);
        showToast({ type: "success", title: "User reinstated" });
      }
      // Refetch rather than patch: suspending writes a moderation row this
      // page shows, so a local status flip would leave the history stale.
      await mutate();
      setConfirmOpen(false);
    } catch {
      showToast({ type: "error", title: "Couldn't update user" });
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-5 w-32 bg-gray-100 rounded animate-shimmer" />
        <div className="h-8 w-2/3 bg-gray-100 rounded animate-shimmer" />
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${ADMIN_PANEL_SURFACE} p-6 space-y-3`}>
            <div className="h-4 w-1/3 bg-gray-100 rounded animate-shimmer" />
            <div className="h-3 w-2/3 bg-gray-100 rounded animate-shimmer" />
            <div className="h-3 w-1/2 bg-gray-100 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (!member) {
    return (
      <AdminNotFound
        title="User not found"
        description="The account you're looking for may have been removed."
        backHref="/admin/users"
        backLabel="Back to users"
      />
    );
  }

  const profile = member.profile ?? null;
  const counts = member.counts;
  const location = [profile?.city, profile?.state_province, profile?.country]
    .filter(Boolean)
    .join(", ");
  const notifications = profile?.notification_preferences;
  const suspended = member.status === "suspended";
  const lastSuspension = member.moderation?.find(
    (row) => row.eventType === "USER_SUSPENDED",
  );
  // Both arrays hold real uploads and members have files in either, so the
  // list is the union. Reading only `documents` reported "Not provided" for
  // everyone, because the profile UI writes to `attachments`.
  const files = [...(profile?.documents ?? []), ...(profile?.attachments ?? [])]
    .map((file) => file.name)
    .filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <AdminBackLink href="/admin/users">Back to users</AdminBackLink>

      <AdminPageHeader
        title={member.full_name}
        description={
          counts && counts.postings > 0
            ? "Member account, posts jobs"
            : "Member account"
        }
        actions={
          // A deactivated account gets no button. Suspending somebody who has
          // already left is meaningless, and reinstating them would reverse
          // their own decision to go.
          standing.action ? (
            <button
              onClick={() => setConfirmOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border ${
                isSuspending
                  ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {isSuspending ? "Suspend User" : "Reinstate User"}
            </button>
          ) : undefined
        }
      />

      <Section
        icon={HiOutlineUser}
        title="Identity"
        description="Who this is and how to reach them."
        aside={
          <StatusPill tone={standing.tone}>{standing.label}</StatusPill>
        }
      >
        <FieldGrid>
          <Field
            label="Email"
            value={member.email}
            href={`mailto:${member.email}`}
          />
          <Field label="Email verified" value={yesNo(member.emailVerified)} />
          <Field label="Phone" value={profile?.phone_number} />
          <Field label="Location" value={location} />
          <Field label="Registered" value={formatDate(member.createdAt ?? "")} />
          <Field
            label="Last active"
            value={
              member.last_active_at ? formatDate(member.last_active_at) : undefined
            }
          />
          <Field label="Account ID" value={member._id} />
        </FieldGrid>
      </Section>

      <Section
        icon={HiOutlineShieldCheck}
        title="Standing"
        description="Everything bearing on whether this account can sign in."
      >
        {/* The conditional fields are conditional on purpose. "Suspension
            reason: Not provided" on an active account is not a gap in the
            record, it is a question that does not apply, and a column of grey
            "Not provided" for inapplicable things trains the reader to skim
            past the ones that do matter. */}
        <FieldGrid>
          <Field label="Status" value={standing.label} />
          {suspended && (
            <>
              <Field
                label="Suspension reason"
                value={lastSuspension?.metadata?.reason}
              />
              <Field
                label="Suspended on"
                value={
                  lastSuspension ? formatDate(lastSuspension.timestamp) : undefined
                }
              />
            </>
          )}
          <Field
            label="Two factor"
            value={member.two_factor_enabled ? "On" : "Off"}
          />
          <Field
            label="Onboarding"
            value={member.onboarding_completed ? "Complete" : "Incomplete"}
          />
          {member.must_change_password && (
            <Field label="Temporary password" value="Must be changed" />
          )}
          {member.deactivated_at && (
            <Field
              label="Deactivated"
              value={formatDate(member.deactivated_at)}
            />
          )}
        </FieldGrid>

        {member.moderation && member.moderation.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Moderation history
            </p>
            <ul className="space-y-2.5">
              {member.moderation.map((row) => (
                <li key={row._id} className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">
                    {eventLabel(row.eventType)}
                  </span>
                  <span className="text-gray-500">
                    {" "}
                    {formatDate(row.timestamp)}
                    {row.email ? ` by ${row.email}` : ""}
                  </span>
                  {row.metadata?.reason && (
                    <span className="block text-gray-500">
                      {row.metadata.reason}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section
        icon={HiOutlineBriefcase}
        title="Profile"
        description="What they told us about themselves."
      >
        <FieldGrid>
          <Field label="Job title" value={profile?.job_title} />
          <Field label="Industry" value={profile?.industry} />
          <Field label="Experience" value={profile?.years_of_experience} />
          <Field
            label="Job seeking"
            value={
              profile?.job_seeking_settings?.status &&
              profile.job_seeking_settings.status !== "none"
                ? profile.job_seeking_settings.status.replace(/_/g, " ")
                : undefined
            }
          />
          <Field
            label="Profile visibility"
            value={profile?.privacy_preferences?.profile_visibility}
          />
          <Field label="Skills" value={profile?.skills?.length ?? 0} />
          {/* Names, not links. Whether somebody uploaded a resume answers the
              support question; reading it is not this screen's business, and
              the server does not send a url for it to link to. */}
          <Field
            label="Documents"
            value={files.length ? files.join(", ") : undefined}
          />
        </FieldGrid>
      </Section>

      {counts && (
        <Section
          icon={HiOutlineChartBar}
          title="Activity"
          description="How much of each thing this account has. Counts only, never contents."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {COUNT_TILES.map((tile) => {
              const value = counts[tile.key];
              const body = (
                <>
                  <p className="text-xs text-gray-500">{tile.label}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
                    {value}
                  </p>
                </>
              );
              const base =
                "rounded-xl border border-gray-200/80 bg-gray-50/60 px-4 py-3";
              return tile.href && value > 0 ? (
                <Link
                  key={tile.key}
                  href={tile.href}
                  className={`${base} hover:bg-white hover:border-gray-300 transition-colors`}
                >
                  {body}
                </Link>
              ) : (
                <div key={tile.key} className={base}>
                  {body}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <Section
        icon={HiOutlineClock}
        title="Recent sign ins"
        description="The last ten security events. The member's full history is in their own data export."
      >
        {member.sign_ins && member.sign_ins.length > 0 ? (
          <div className="-mx-5 md:-mx-6 overflow-x-auto">
            <AdminTable>
              <AdminTableHead>
                <AdminTableTh className="whitespace-nowrap">When</AdminTableTh>
                <AdminTableTh className="whitespace-nowrap">Event</AdminTableTh>
                <AdminTableTh className="whitespace-nowrap">From</AdminTableTh>
                <AdminTableTh className="whitespace-nowrap">Using</AdminTableTh>
              </AdminTableHead>
              <AdminTableBody>
                {member.sign_ins.map((event) => (
                  <SignInRow key={event._id} event={event} />
                ))}
              </AdminTableBody>
            </AdminTable>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No sign in events in the last 180 days.
          </p>
        )}
      </Section>

      <Section
        icon={HiOutlineEnvelope}
        title="Email and consent"
        description="What this account agreed to receive."
      >
        <FieldGrid>
          <Field
            label="Marketing email"
            value={member.promotional_emails ? "Consented" : "Not consented"}
          />
          {member.marketing_consent_at && (
            <Field
              label="Consent given"
              value={formatDate(member.marketing_consent_at)}
            />
          )}
          {/* All seven, not the four that happen to apply to a job seeker.
              This section answers "why am I getting these emails", and a
              partial list answers it wrongly: one account both applies and
              posts, so the poster-side switches are as likely to be the
              cause as the seeker-side ones. */}
          {NOTIFICATION_FIELDS.map(({ key, label }) => (
            <Field
              key={key}
              label={label}
              value={notifications ? yesNo(notifications[key]) : undefined}
            />
          ))}
          {/* Status and dates, never a download link. Whether their export
              worked is a support question; its contents are not. */}
          <Field
            label="Last data export"
            value={
              member.last_export
                ? `${member.last_export.status}${
                    member.last_export.requested_at
                      ? ` on ${formatDate(member.last_export.requested_at)}`
                      : ""
                  }`
                : // Not the same as a missing value. Nobody failed to fill
                  // this in; the member has never asked for their archive.
                  "None requested"
            }
          />
        </FieldGrid>
      </Section>

      <ConfirmDialog
        {...userStandingConfirm(isSuspending)}
        open={confirmOpen}
        subject={member.full_name}
        busy={busy}
        onClose={() => (busy ? null : setConfirmOpen(false))}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default AdminUserDetail;

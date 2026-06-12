# Admin — Backend Follow-ups

The admin dashboard frontend is fully wired with mock data. To swap to real
APIs, the backend needs the endpoints below.

All admin routes must sit behind `authenticateToken` and
`authorizeRoles(USER_ROLES.ADMIN)` — the frontend role guard is UX only.

## Conventions

- Mount under `/api/v1/admin`
- Wrap responses in the existing `ApiEnvelope<T>` shape:
  ```json
  { "success": true, "message": "...", "data": { ... } }
  ```
- Use ISO 8601 strings for dates
- Use `PaginatedApiEnvelope<T>` for list endpoints
- `200` for reads and successful mutations, standard error envelope on failures

## Frontend swap points

When endpoints land, replace the mock fetchers in:

| Hook                                   | Calls (TODO)                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `hooks/useAdminOverview.ts`            | `GET /api/v1/admin/overview`                                                     |
| `hooks/useAdminJobQueue.ts`            | `GET /api/v1/admin/jobs?status=...`                                              |
|                                        | `POST /api/v1/admin/jobs/:id/approve`                                            |
|                                        | `POST /api/v1/admin/jobs/:id/reject`                                             |
|                                        | `POST /api/v1/admin/jobs/:id/unpublish`                                          |
| `hooks/useAdminEmployers.ts`           | `GET /api/v1/admin/employers`                                                    |
|                                        | `POST /api/v1/admin/employers/:id/suspend`                                       |
|                                        | `POST /api/v1/admin/employers/:id/reinstate`                                     |
| `hooks/useAdminUsers.ts`               | `GET /api/v1/admin/users`                                                        |
|                                        | `POST /api/v1/admin/users/:id/suspend`                                           |
|                                        | `POST /api/v1/admin/users/:id/reinstate`                                         |
| `hooks/useAdminCommunity.ts`           | `GET /api/v1/admin/community/posts`                                              |
|                                        | `DELETE /api/v1/admin/community/posts/:id`                                       |
| `hooks/useAdminNotifications.ts`       | `GET /api/v1/admin/notifications`                                                |
|                                        | `POST /api/v1/admin/notifications/:id/read`                                      |
|                                        | `POST /api/v1/admin/notifications/read-all`                                      |
| `hooks/useAdminSettings.ts`            | `GET /api/v1/admin/settings`                                                     |
|                                        | `PATCH /api/v1/admin/settings/profile`                                           |
|                                        | `PATCH /api/v1/admin/settings/password`                                          |
|                                        | `PATCH /api/v1/admin/settings/notifications`                                     |
| `hooks/useAdminSupport.ts`             | `GET /api/v1/admin/support/tickets`                                              |
|                                        | `POST /api/v1/admin/support/tickets/:id/replies`                                 |
|                                        | `POST /api/v1/admin/support/tickets/:id/resolve`                                 |
|                                        | `POST /api/v1/admin/support/tickets/:id/close`                                   |
| `hooks/useAdminTeam.ts`                | `GET /api/v1/admin/team`                                                         |
|                                        | `POST /api/v1/admin/team/invites`                                                |
|                                        | `POST /api/v1/admin/team/invites/:id/resend`                                     |
|                                        | `POST /api/v1/admin/team/invites/:id/revoke`                                     |
|                                        | `PATCH /api/v1/admin/team/members/:id`                                           |
|                                        | `POST /api/v1/admin/team/members/:id/suspend`                                    |
|                                        | `POST /api/v1/admin/team/members/:id/reinstate`                                  |
|                                        | `DELETE /api/v1/admin/team/members/:id`                                          |
| `hooks/useAdminAuditLog.ts`            | `GET /api/v1/admin/team/audit-log`                                               |
| `hooks/useAdminInviteAcceptance.ts`    | `GET /api/v1/auth/admin-invites/:token`                                          |
|                                        | `POST /api/v1/auth/admin-invites/:token/accept`                                  |

The frontend types in those files mirror the contracts below, so swaps should be roughly one-line per call site.

---

## Dashboard

### `GET /api/v1/admin/overview`

```ts
{
  stats: {
    jobsPending: number;
    activeJobs: number;       // status === "published" / "approved"
    employers: number;
    users: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;            // job role
    company: string;          // company_name
    status: "pending" | "approved" | "rejected";
    date: string;             // ISO submission date
  }>;
}
```

`recentActivity` is the most recent 10 jobs across all statuses, sorted by `createdAt` desc.

---

## Jobs

### `GET /api/v1/admin/jobs`

**Query:** `status` (`pending | approved | rejected`, required), `page`, `limit`.

**Response `data.jobs`:**

```ts
Array<{
  id: string;
  role: string;
  company_name: string;
  company_logo?: string;
  location: string;
  employment_type: string;       // "Part-Time" | "Full-Time" | "Contract" | "Seasonal" ...
  salary_range?: string;         // e.g. "$18-$22/hr"
  description: string;
  requirements: string[];
  submittedAt: string;           // ISO
  approvedAt?: string;           // populated when status === "approved"
  rejectedAt?: string;           // populated when status === "rejected"
  applications?: number;         // approved listings only
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;     // populated when status === "rejected"
  employer: { id: string; verified: boolean };
}>
```

### `POST /api/v1/admin/jobs/:id/approve`

**Body:** none, or optional `{ note?: string }`

Sets status to `approved` (or `published`), stamps `approvedAt`, writes audit log, notifies employer.

### `POST /api/v1/admin/jobs/:id/reject`

**Body:** `{ reason: string }` (required, min 5 chars).

Sets status to `rejected`, stamps `rejectedAt`, stores `rejection_reason`, audit log + employer notification.

### `POST /api/v1/admin/jobs/:id/unpublish`

**Body:** `{ reason: string }` (required, min 5 chars).

Removes a previously approved listing from public view, stores reason, audit log + employer notification.

---

## Employers

### `GET /api/v1/admin/employers`

```ts
Array<{
  id: string;
  company_name: string;
  industry: string;
  location: string;
  registeredAt: string;          // ISO
  status: "active" | "suspended" | "pending";
}>
```

### `POST /api/v1/admin/employers/:id/suspend`

**Body:** `{ reason: string }` (required, min 5 chars).

Suspending should:
- Set employer `status` to `suspended`
- Block new job postings and message sending
- Optionally hide currently published jobs (TBD — see open questions below)
- Audit log + employer notification

### `POST /api/v1/admin/employers/:id/reinstate`

**Body:** none. Restores to `active`. Idempotent.

---

## Users (job seekers)

### `GET /api/v1/admin/users`

```ts
Array<{
  id: string;
  full_name: string;
  email: string;
  registeredAt: string;
  applications: number;          // count of submitted applications
  status: "active" | "suspended";
}>
```

### `POST /api/v1/admin/users/:id/suspend`

**Body:** `{ reason: string }` (required, min 5 chars).

Suspending blocks sign-in and application submission. Audit log + email to user.

### `POST /api/v1/admin/users/:id/reinstate`

**Body:** none. Idempotent.

---

## Community

### `GET /api/v1/admin/community/posts`

```ts
Array<{
  id: string;
  title: string;
  author: string;
  postedAt: string;              // ISO
}>
```

(Add `author_id`, `body`, `flag_count`, `status` once the community feature is fully spec'd. The current shape is just enough to power the moderation table.)

### `DELETE /api/v1/admin/community/posts/:id`

**Body:** `{ reason: string }` (required, min 5 chars).

Soft-delete the post (don't hard-purge — needed for audit). Notify the author.

---

## Notifications (admin inbox)

This is **separate** from end-user notifications. Items represent platform events
relevant to admins (new submissions, employer registrations, reports, flags).

### `GET /api/v1/admin/notifications`

```ts
Array<{
  id: string;
  type:
    | "job_submitted"
    | "employer_registered"
    | "employer_verified"
    | "user_report"
    | "post_flagged";
  message: string;
  createdAt: string;             // ISO
  read: boolean;
}>
```

### `POST /api/v1/admin/notifications/:id/read`

**Body:** none. Marks one as read. Idempotent.

### `POST /api/v1/admin/notifications/read-all`

**Body:** none. Marks every unread admin notification read for the current admin.

Emit notifications from the relevant domain events (job created, employer registered, post flagged, etc.). Storing them in a dedicated `admin_notification` collection keyed by admin user id keeps the read state per-admin.

---

## Settings

### `GET /api/v1/admin/settings`

```ts
{
  first_name: string;
  last_name: string;
  email: string;
  notifications: {
    email_alerts: boolean;
    new_job_submissions: boolean;
    user_reports: boolean;
  };
}
```

### `PATCH /api/v1/admin/settings/profile`

**Body:** `{ first_name: string; last_name: string; email: string }`.

Email change should re-trigger email verification.

### `PATCH /api/v1/admin/settings/password`

**Body:** `{ current_password: string; new_password: string }`.

Verify current password, enforce password policy (>= 8 chars, etc.). Invalidate other sessions on success. Audit log.

### `PATCH /api/v1/admin/settings/notifications`

**Body:** matches the `notifications` object above. All booleans.

---

## Support tickets

End-user-facing support requests. Submission happens via a separate (public)
endpoint that the contact / help form will hit; the admin endpoints below are
only for managing the resulting tickets.

### `GET /api/v1/admin/support/tickets`

```ts
Array<{
  id: string;                                     // human ID, e.g. "TKT-001"
  subject: string;
  description: string;
  submitter: { id: string; name: string; email: string };
  type:
    | "bug_report"
    | "general_inquiry"
    | "report"
    | "account_issue"
    | "payment_issue"
    | "other";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  responses: Array<{
    id: string;
    author: "admin" | "user";
    authorName: string;
    message: string;
    createdAt: string;
  }>;
}>
```

### `POST /api/v1/admin/support/tickets/:id/replies`

**Body:** `{ message: string }` (required, trimmed, non-empty).

Appends an admin response to the ticket and bumps `status` from `open` to
`in_progress` if it was open. Notify the submitter via email.

**Response:** the new `TicketResponse` object that was appended.

### `POST /api/v1/admin/support/tickets/:id/resolve`

**Body:** none. Sets `status` to `resolved`. Idempotent.

### `POST /api/v1/admin/support/tickets/:id/close`

**Body:** none. Sets `status` to `closed`. Closed tickets cannot accept new
replies (frontend disables the reply box; backend should enforce). Idempotent.

---

## Admin team (super admin only)

End-to-end model documented in **`/BETODO.txt`** (sections 1, 2, 4). Below
is the wire-level contract.

### `GET /api/v1/admin/team`

```ts
{
  members: Array<{
    id: string;
    full_name: string;
    email: string;
    picture?: string;
    role: "admin" | "super_admin";
    status: "active" | "suspended";
    two_factor_enabled: boolean;
    invitedAt: string;
    joinedAt?: string;
    lastSignInAt?: string;
  }>;
  invites: Array<{
    id: string;
    email: string;
    role: "admin" | "super_admin";
    status: "pending" | "accepted" | "revoked" | "expired";
    invitedBy: { id: string; name: string };
    invitedAt: string;
    expiresAt: string;
  }>;
}
```

### `POST /api/v1/admin/team/invites`

**Body:** `{ email, role: "admin"|"super_admin" }`. Generates token, hashes it,
emails the invitee a link to `/accept-admin-invite/<raw_token>`. Returns the
new invite (without the raw token).

### `POST /api/v1/admin/team/invites/:id/resend`

Regenerates token, bumps `expiresAt`, re-sends email.

### `POST /api/v1/admin/team/invites/:id/revoke`

Marks invite revoked. Stored token hash must reject after this.

### `PATCH /api/v1/admin/team/members/:id`

**Body:** `{ role: "admin"|"super_admin" }`. Cannot demote the last super
admin. Self-demotion blocked.

### `POST /api/v1/admin/team/members/:id/suspend`

**Body:** `{ reason: string }`. Status → `suspended`. Invalidate sessions.
Cannot suspend yourself.

### `POST /api/v1/admin/team/members/:id/reinstate`

Status → `active`. Idempotent.

### `DELETE /api/v1/admin/team/members/:id`

**Body:** `{ reason: string }`. Removes admin powers. Cannot remove yourself
or the last super admin.

### `GET /api/v1/admin/team/audit-log`

Paginated. Returns `AuditLogEntry[]`:

```ts
{
  id: string;
  action: string;            // e.g. "admin.invited", "job.approved"
  actor: { id: string; name: string };
  target?: { id: string; label: string };
  metadata?: Record<string, string>;
  createdAt: string;
}
```

---

## Public invite acceptance

Both endpoints are **unauthenticated** — the token is the credential.

### `GET /api/v1/auth/admin-invites/:token`

Hash the supplied token, look up. Reject if not pending or expired.
Response:

```ts
{ email: string; role: "admin"|"super_admin"; invitedBy: string; expiresAt: string }
```

Error responses must NOT leak whether the email exists.

### `POST /api/v1/auth/admin-invites/:token/accept`

**Body:** `{ full_name: string; password: string }`.

Validate password policy. Create or update user with `role="admin"`,
`is_super_admin = (invite.role === "super_admin")`, `emailVerified=true`.
Mark invite accepted. Force 2FA enrollment on next sign-in.

---

## Security checklist

- [ ] All admin routes require `authorizeRoles(USER_ROLES.ADMIN)`
- [ ] Session role is verified against the DB on every request — admin demotions must take effect immediately
- [ ] Every mutating endpoint writes to `audit_log` with `actorId`, `action`, `targetId`, `metadata`
- [ ] Reject / suspend / unpublish / remove flows validate non-empty `reason` server-side (>= 5 chars)
- [ ] Approve/reject endpoints are idempotent (re-approving an approved job is a 200 no-op)
- [ ] Rate-limit admin mutations (`express-rate-limit`) to mitigate compromised-session damage
- [ ] Self-registration `role` enum continues to exclude `admin` (already enforced in `auth.schema.ts`)
- [ ] Suspended employers/users cannot log in or use authenticated endpoints (`authenticateToken` should reject suspended sessions)
- [ ] Password change invalidates other sessions for the admin

## Open questions

- **Suspending an employer** — should already-approved jobs be auto-unpublished, or stay live? Default suggestion: auto-unpublish, with a flag on the audit log entry, so reinstating can offer a "republish previous jobs" follow-up.
- **Notification storage** — per-admin read state vs broadcast read state? Per-admin is implied by the API; confirm before implementing.
- **Pagination defaults** — pick `limit=20, page=1` and surface pagination metadata via `PaginatedApiEnvelope`.
- **Support ticket priority** — assigned by the user at submission, or auto-derived (e.g. payment_issue → critical)? Default suggestion: user picks Low/Medium/High; backend can promote certain types to Critical automatically.

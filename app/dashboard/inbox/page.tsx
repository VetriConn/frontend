"use client";

import Inbox from "@/components/pages/dashboard/inbox/Inbox";

/**
 * One inbox for one account. There used to be an employer view and a job-seeker
 * view chosen by role; the same person can now be applying in one thread and
 * hiring in another, so both live in a single list.
 */
export default function InboxPage() {
  return <Inbox />;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineKey, HiOutlineArrowRight } from "react-icons/hi2";

/**
 * Says why every admin page is refusing to load.
 *
 * An account still holding its bootstrap password is blocked by
 * requirePasswordChange on the API, not by the UI, so the console renders
 * normally and then each page fails on its own fetch. What the reader sees
 * is whatever that page says when a request fails: on the traffic report,
 * "You may not have access to this queue, or the request failed." The real
 * cause is specific and one click away, and nothing said so.
 *
 * A banner rather than a redirect or a blocking modal. The admin can still
 * read the chrome and find their way to Settings, and a layout-level
 * redirect on a condition the API also enforces is how people get trapped
 * in a loop when the two disagree.
 *
 * Hidden on the settings page itself, where the form it points at is
 * already on screen and opened.
 */
export default function AdminPasswordNotice({ show }: { show: boolean }) {
  const pathname = usePathname();
  if (!show || pathname?.startsWith("/admin/settings")) return null;

  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <HiOutlineKey
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-900">
          Set a new password to finish signing in
        </p>
        <p className="mt-0.5 text-sm text-amber-800">
          This account is still on its one-time bootstrap password, so the
          rest of the console will not load until you replace it. Pages you
          open before then will report that they could not load.
        </p>
      </div>
      <Link
        href="/admin/settings"
        className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white no-underline transition-colors hover:bg-amber-700"
      >
        Set a password
        <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

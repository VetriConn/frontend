"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineChevronRight, HiOutlineHome } from "react-icons/hi2";

// Map route segments to user-friendly labels
const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  profile: "My Profile",
  settings: "Account Settings",
  "applied-jobs": "Applied Jobs",
  "saved-jobs": "Saved Jobs",
  "saved-searches": "Saved Searches",
  jobs: "Browse Jobs",
  notifications: "Notifications",
  community: "Community",
  inbox: "Inbox",
};

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();

  // Only show breadcrumbs within /dashboard sub-pages
  if (!pathname || pathname === "/dashboard") return null;

  const segments = pathname.split("/").filter(Boolean);
  // segments: ["dashboard", "profile"], ["dashboard", "applied-jobs"], etc.

  if (segments.length < 2) return null;

  // Build breadcrumb items
  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label =
      ROUTE_LABELS[segment] ||
      segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="bg-red-50 border-b border-red-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-4 py-2.5">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {index > 0 && (
                <HiOutlineChevronRight
                  className="w-3.5 h-3.5 text-gray-400 shrink-0"
                  aria-hidden="true"
                />
              )}
              {crumb.isLast ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {index === 0 && (
                    <HiOutlineHome className="w-4 h-4 inline mr-1.5 -mt-0.5 text-gray-500" />
                  )}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  {index === 0 && (
                    <HiOutlineHome className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  )}
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

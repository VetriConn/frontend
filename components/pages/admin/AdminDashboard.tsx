"use client";

import Link from "next/link";
import clsx from "clsx";
import {
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineBriefcase,
} from "react-icons/hi2";
import { useAdminOverview } from "@/hooks/useAdminOverview";

type StatTone = "amber" | "emerald" | "indigo" | "rose";

interface StatCardProps {
  label: string;
  value: number | string;
  delta?: { value: string; positive?: boolean };
  icon: React.ComponentType<{ className?: string }>;
  tone: StatTone;
}

const TONE_STYLES: Record<
  StatTone,
  { iconBg: string; iconText: string; ring: string }
> = {
  amber: {
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    ring: "ring-amber-100",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    ring: "ring-emerald-100",
  },
  indigo: {
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-600",
    ring: "ring-indigo-100",
  },
  rose: {
    iconBg: "bg-rose-50",
    iconText: "text-rose-600",
    ring: "ring-rose-100",
  },
};

const StatCard = ({ label, value, delta, icon: Icon, tone }: StatCardProps) => {
  const t = TONE_STYLES[tone];
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)] transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight tabular-nums">
            {value}
          </p>
          {delta && (
            <p
              className={clsx(
                "mt-1.5 inline-flex items-center gap-1 text-xs font-medium",
                delta.positive ? "text-emerald-600" : "text-gray-500",
              )}
            >
              {delta.value}
            </p>
          )}
        </div>
        <div
          className={clsx(
            "w-11 h-11 rounded-xl ring-1 flex items-center justify-center shrink-0",
            t.iconBg,
            t.iconText,
            t.ring,
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

type ActivityStatus = "pending" | "approved" | "rejected";

const STATUS_PILL: Record<ActivityStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200/70",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200/70",
};

const STATUS_LABEL: Record<ActivityStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const formatActivityDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const AdminDashboard = () => {
  const { data, isLoading } = useAdminOverview();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform overview and moderation queue
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          label="Jobs Pending Review"
          value={isLoading ? "—" : data.stats.jobsPending}
          delta={{ value: "Awaiting moderation" }}
          icon={HiOutlineClock}
          tone="amber"
        />
        <StatCard
          label="Active Jobs"
          value={isLoading ? "—" : data.stats.activeJobs}
          delta={{
            value: `+${data.stats.activeJobsThisWeek} this week`,
            positive: data.stats.activeJobsThisWeek > 0,
          }}
          icon={HiOutlineCheckCircle}
          tone="emerald"
        />
        <StatCard
          label="Companies Registered"
          value={isLoading ? "—" : data.stats.companies}
          delta={{
            value: `+${data.stats.companiesThisWeek} this week`,
            positive: data.stats.companiesThisWeek > 0,
          }}
          icon={HiOutlineBuildingOffice2}
          tone="indigo"
        />
        <StatCard
          label="Users Registered"
          value={isLoading ? "—" : data.stats.users}
          delta={{
            value: `+${data.stats.usersThisWeek} this week`,
            positive: data.stats.usersThisWeek > 0,
          }}
          icon={HiOutlineUsers}
          tone="rose"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_8px_20px_-12px_rgba(229,62,62,0.7)]"
        >
          <HiOutlineBriefcase className="w-4 h-4" />
          Approve Jobs
          {!isLoading && data.stats.jobsPending > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white/20 text-[11px] font-bold tabular-nums">
              {data.stats.jobsPending}
            </span>
          )}
        </Link>
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-2 bg-white text-gray-800 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <HiOutlineShieldCheck className="w-4 h-4 text-gray-500" />
          Review Companies
        </Link>
      </div>

      {/* Recent activity */}
      <section className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
        <header className="px-5 md:px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest job submissions awaiting decisions
            </p>
          </div>
          <Link
            href="/admin/jobs"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
          >
            View all
            <HiOutlineArrowRight className="w-3.5 h-3.5" />
          </Link>
        </header>

        <ul className="divide-y divide-gray-100">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="px-5 md:px-6 py-4 animate-pulse">
                  <div className="h-4 w-1/3 bg-gray-100 rounded mb-2" />
                  <div className="h-3 w-1/5 bg-gray-100 rounded" />
                </li>
              ))
            : data.recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="group px-5 md:px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/70 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/jobs?job=${item.id}`}
                      className="block text-sm font-semibold text-gray-900 hover:text-primary truncate"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {item.company}
                    </p>
                  </div>

                  <span
                    className={clsx(
                      "shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1",
                      STATUS_PILL[item.status],
                    )}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>

                  <span className="hidden md:block shrink-0 text-xs text-gray-500 tabular-nums w-24 text-right">
                    {formatActivityDate(item.date)}
                  </span>

                  <Link
                    href={`/admin/jobs?job=${item.id}`}
                    aria-label={`Open ${item.title}`}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-gray-700 group-hover:bg-white border border-transparent group-hover:border-gray-200 transition-colors"
                  >
                    <HiOutlineArrowRight className="w-4 h-4" />
                  </Link>
                </li>
              ))}
        </ul>

        {!isLoading && data.recentActivity.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No recent activity yet.
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;

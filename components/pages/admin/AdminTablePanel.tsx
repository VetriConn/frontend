"use client";

import { ReactNode } from "react";
import clsx from "clsx";
import Link from "next/link";
import {
  HiOutlineEye,
  HiOutlineNoSymbol,
  HiOutlineTrash,
} from "react-icons/hi2";

// ─── Page header ─────────────────────────────────────────────────────────────

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const AdminPageHeader = ({
  title,
  description,
  actions,
}: AdminPageHeaderProps) => (
  <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </header>
);

// ─── Table panel ─────────────────────────────────────────────────────────────

interface AdminTablePanelProps {
  children: ReactNode;
  className?: string;
}

export const AdminTablePanel = ({
  children,
  className,
}: AdminTablePanelProps) => (
  <section
    className={clsx(
      "bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden",
      className,
    )}
  >
    <div className="overflow-x-auto">{children}</div>
  </section>
);

// ─── Table primitives ────────────────────────────────────────────────────────

interface AdminTableProps {
  children: ReactNode;
}

export const AdminTable = ({ children }: AdminTableProps) => (
  <table className="w-full text-sm">{children}</table>
);

interface AdminTableHeadProps {
  children: ReactNode;
}

export const AdminTableHead = ({ children }: AdminTableHeadProps) => (
  <thead className="bg-gray-50/60 border-b border-gray-100">
    <tr>{children}</tr>
  </thead>
);

interface AdminTableThProps {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

export const AdminTableTh = ({
  children,
  align = "left",
  className,
}: AdminTableThProps) => (
  <th
    className={clsx(
      "px-5 md:px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500",
      align === "right" ? "text-right" : "text-left",
      className,
    )}
  >
    {children}
  </th>
);

interface AdminTableBodyProps {
  children: ReactNode;
}

export const AdminTableBody = ({ children }: AdminTableBodyProps) => (
  <tbody className="divide-y divide-gray-100">{children}</tbody>
);

interface AdminTableRowProps {
  children: ReactNode;
  className?: string;
}

export const AdminTableRow = ({ children, className }: AdminTableRowProps) => (
  <tr
    className={clsx(
      "hover:bg-gray-50/70 transition-colors",
      className,
    )}
  >
    {children}
  </tr>
);

interface AdminTableTdProps {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

export const AdminTableTd = ({
  children,
  align = "left",
  className,
}: AdminTableTdProps) => (
  <td
    className={clsx(
      "px-5 md:px-6 py-3.5 text-sm text-gray-700",
      align === "right" ? "text-right" : "text-left",
      className,
    )}
  >
    {children}
  </td>
);

// ─── Status pill ─────────────────────────────────────────────────────────────

type PillTone = "amber" | "emerald" | "indigo" | "rose" | "gray";

const TONES: Record<PillTone, string> = {
  amber: "bg-amber-50 text-amber-700 ring-amber-200/70",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  rose: "bg-rose-50 text-rose-700 ring-rose-200/70",
  gray: "bg-gray-100 text-gray-600 ring-gray-200/70",
};

interface StatusPillProps {
  tone: PillTone;
  children: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

export const StatusPill = ({ tone, children, icon: Icon }: StatusPillProps) => (
  <span
    className={clsx(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1",
      TONES[tone],
    )}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {children}
  </span>
);

// ─── Row actions ─────────────────────────────────────────────────────────────

interface RowActionsProps {
  children: ReactNode;
}

export const RowActions = ({ children }: RowActionsProps) => (
  <div className="flex items-center justify-end gap-2">{children}</div>
);

interface ViewActionProps {
  href?: string;
  onClick?: () => void;
  label?: string;
}

export const ViewAction = ({
  href,
  onClick,
  label = "View",
}: ViewActionProps) => {
  const className =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors";
  const content = (
    <>
      <HiOutlineEye className="w-3.5 h-3.5 text-gray-500" />
      {label}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
};

interface DangerActionProps {
  label: string;
  onClick?: () => void;
  icon?: "suspend" | "remove";
  disabled?: boolean;
}

export const DangerAction = ({
  label,
  onClick,
  icon = "suspend",
  disabled,
}: DangerActionProps) => {
  const Icon = icon === "remove" ? HiOutlineTrash : HiOutlineNoSymbol;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
};

// ─── Generic empty state for tables ──────────────────────────────────────────

interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AdminEmptyState = ({
  title,
  description,
  icon: Icon,
}: AdminEmptyStateProps) => (
  <div className="px-6 py-14 text-center">
    <div className="mx-auto w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
  </div>
);

// ─── Skeleton row ────────────────────────────────────────────────────────────

interface AdminRowSkeletonProps {
  columns: number;
}

export const AdminRowSkeleton = ({ columns }: AdminRowSkeletonProps) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-5 md:px-6 py-4">
        <div className="h-3.5 w-2/3 bg-gray-100 rounded animate-shimmer" />
      </td>
    ))}
  </tr>
);

// ─── Summary stat card ───────────────────────────────────────────────────────

export type StatTone = "amber" | "emerald" | "rose" | "indigo" | "gray";

const STAT_TONES: Record<StatTone, string> = {
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  gray: "bg-gray-100 text-gray-600 ring-gray-200",
};

/** The summary card that heads every admin list page. */
export const AdminStatCard = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone: StatTone;
}) => (
  <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight tabular-nums">
          {value}
        </p>
      </div>
      <div
        className={clsx(
          "w-11 h-11 rounded-xl ring-1 flex items-center justify-center shrink-0",
          STAT_TONES[tone],
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

/** Row of summary cards; 2-up on mobile, 4-up on desktop. */
export const AdminStatRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">{children}</div>
);

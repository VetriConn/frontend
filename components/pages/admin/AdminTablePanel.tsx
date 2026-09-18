/**
 * Furniture for the admin console's pages, not only for their tables.
 *
 * That distinction is where this file kept losing ground. It grew as the
 * table shell, so anything sitting outside the panel border had nowhere to
 * go and got hand-written again in every page that wanted it: the status tab
 * bar above the table, the back link and the "record is gone" card on a
 * detail route. Companies and Jobs ended up with twenty-seven identical
 * lines of tab bar each, and the two detail routes with a byte-identical
 * local `Field`, all of it while importing a dozen pieces from here. The
 * abstraction was not missing, its edge was drawn at the wrong place.
 *
 * So: the name says table, the scope is the admin page. Anything two admin
 * pages draw the same way belongs here, table or not.
 */

import { ReactNode } from "react";
import clsx from "clsx";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
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

// ─── Filter tabs ─────────────────────────────────────────────────────────────

interface AdminFilterTab<V extends string> {
  value: V;
  label: string;
  /** Badge beside the label. Undefined or zero renders no badge. */
  count?: number;
}

/**
 * The status bar between the stat cards and the table.
 *
 * Companies and Jobs each wrote this out by hand and agreed on every class,
 * because the shell stopped at the panel and this sits above it. The cost
 * was not the lines, it was that the control most likely to gain a tab was
 * the one control nobody could change in a single place.
 *
 * Reports keeps its own pair of bars deliberately, so do not fold them in:
 * its status tabs tint the badge rose to carry an alarm count and drop
 * `flex-wrap` because a second bar sits beside them, and its type tabs are a
 * lighter weight on a dark active pill. Those would need props that exist
 * only to keep a divergence alive.
 */
export const AdminFilterTabs = <V extends string>({
  label,
  tabs,
  value,
  onChange,
}: {
  /** Names the tablist for screen readers, e.g. "Company status". */
  label: string;
  tabs: readonly AdminFilterTab<V>[];
  value: V;
  onChange: (next: V) => void;
}) => (
  <div
    className="inline-flex flex-wrap rounded-xl border border-gray-200 bg-white p-1"
    role="tablist"
    aria-label={label}
  >
    {tabs.map((tab) => {
      const active = value === tab.value;
      return (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active}
          onClick={() => onChange(tab.value)}
          className={clsx(
            "px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors",
            active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50",
          )}
        >
          {tab.label}
          {typeof tab.count === "number" && tab.count > 0 && (
            <span
              className={clsx(
                "ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[0.6875rem] font-bold",
                active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600",
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
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
      "px-5 md:px-6 py-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-500",
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
  /**
   * Opens the row's detail view. Clicks that land on interactive descendants
   * (kebab, links, buttons) are ignored, so an action never also opens the
   * drawer behind it. The kebab's "View details" remains the keyboard path;
   * the whole-row target is a convenience on top, not a replacement.
   */
  onOpen?: () => void;
}

export const AdminTableRow = ({
  children,
  className,
  onOpen,
}: AdminTableRowProps) => (
  <tr
    onClick={
      onOpen
        ? (e) => {
            const el = e.target as HTMLElement;
            if (el.closest("button, a, input, label, [role='menu']")) return;
            onOpen();
          }
        : undefined
    }
    className={clsx(
      "hover:bg-gray-50/70 transition-colors",
      onOpen && "cursor-pointer",
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
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold ring-1",
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

type StatTone = "amber" | "emerald" | "rose" | "indigo" | "gray";

const STAT_TONES: Record<StatTone, string> = {
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  gray: "bg-gray-100 text-gray-600 ring-gray-200",
};

/** Value color for the icon-less variant, where the tone tints the number. */
const STAT_VALUE_TEXT: Record<StatTone, string> = {
  amber: "text-amber-600",
  emerald: "text-emerald-600",
  rose: "text-rose-600",
  indigo: "text-indigo-600",
  gray: "text-gray-900",
};

/**
 * The summary card that heads every admin list page — the ONE implementation.
 * (It used to be re-written locally in five components, each drifting a
 * little; the variants folded back in as optional props.)
 */
export const AdminStatCard = ({
  icon: Icon,
  label,
  value,
  tone,
  delta,
}: {
  /** Icon chip. Without one, the tone tints the value instead. */
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone: StatTone;
  /** Small trend note under the value (dashboard cards). */
  delta?: { value: string; positive?: boolean };
}) => (
  <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)] transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[0.8125rem] font-medium text-gray-500">{label}</p>
        <p
          className={clsx(
            "mt-2 text-3xl font-bold tracking-tight tabular-nums",
            Icon ? "text-gray-900" : STAT_VALUE_TEXT[tone],
          )}
        >
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
      {Icon && (
        <div
          className={clsx(
            "w-11 h-11 rounded-xl ring-1 flex items-center justify-center shrink-0",
            STAT_TONES[tone],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  </div>
);

/** Row of summary cards; 2-up on mobile, 4-up on desktop. */
export const AdminStatRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">{children}</div>
);

/** Pagination shape the backend's paginated() envelope returns. */
interface AdminPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasPrev?: boolean;
  hasNext?: boolean;
}

/**
 * The footer pager every admin table shares. Reports and support tickets
 * used to fetch page 1 of 10 with no controls at all - rows past ten were
 * unreachable while the header counters showed the true totals.
 */
export const AdminPagination = ({
  pagination,
  onPage,
}: {
  pagination?: AdminPaginationMeta | null;
  onPage: (page: number) => void;
}) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { currentPage, totalPages, totalItems } = pagination;
  const hasPrev = pagination.hasPrev ?? currentPage > 1;
  const hasNext = pagination.hasNext ?? currentPage < totalPages;
  return (
    <div className="flex items-center justify-between gap-4 px-5 md:px-6 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500 tabular-nums">
        Page {currentPage} of {totalPages} · {totalItems} total
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(Math.max(1, currentPage - 1))}
          disabled={!hasPrev}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <HiOutlineChevronLeft className="w-4 h-4" />
          Prev
        </button>
        <button
          onClick={() => onPage(currentPage + 1)}
          disabled={!hasNext}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <HiOutlineChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * A failed table fetch, said plainly. Every queue used to render its
 * cheerful empty state ("No users yet") over a 403 or a network error -
 * for tiers without access that read as an empty platform.
 */
export const AdminLoadError = ({
  what,
  onRetry,
}: {
  /** e.g. "reports" */
  what: string;
  onRetry?: () => void;
}) => (
  <div className="px-6 py-14 text-center">
    <p className="text-sm font-semibold text-gray-900 mb-1">
      Couldn&apos;t load {what}
    </p>
    <p className="text-sm text-gray-500 mb-4">
      You may not have access to this queue, or the request failed.
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 min-h-[44px] rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        Try again
      </button>
    )}
  </div>
);

// ─── Detail routes ───────────────────────────────────────────────────────────

/**
 * The way back out of a detail route. Three pages spelled this link out,
 * identically, down to the icon size, because a detail page is the one admin
 * screen with no table on it and so reached for nothing in this file.
 */
export const AdminBackLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-primary"
  >
    <HiOutlineArrowLeft className="w-4 h-4" />
    {children}
  </Link>
);

/**
 * A detail route whose record is gone. Not the same failure as
 * AdminLoadError: the fetch worked, so there is nothing to retry and the
 * only useful offer is the way back. Users and community posts drew the
 * identical card and differed in three strings.
 */
export const AdminNotFound = ({
  title,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) => (
  <div className="max-w-2xl mx-auto py-10">
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-10 text-center">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:text-primary-hover"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>
    </div>
  </div>
);

/**
 * One labelled fact in a detail page's dl.
 *
 * The name is long on purpose. Both detail routes carried this as a local
 * `Field`, byte for byte, but CompanyDetail has its own `Field` under the
 * same name with a different shape: a dt/dd pair, an optional link, a "Not
 * provided" fallback and no icon. Two components called `Field` in one
 * folder is how that pair stayed invisible, so this one says which it is.
 */
export const AdminDetailField = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

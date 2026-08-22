"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";
import {
  HiOutlineSquares2X2,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChevronDown,
  HiOutlineXMark,
  HiOutlineLifebuoy,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { useUserProfile } from "@/hooks/useUserProfile";
import { isSuperAdmin } from "@/lib/admin-permissions";

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: HiOutlineSquares2X2,
  },
  {
    label: "Jobs",
    href: "/admin/jobs",
    icon: HiOutlineBriefcase,
    children: [
      { label: "Pending Review", href: "/admin/jobs/pending" },
      { label: "Approved Jobs", href: "/admin/jobs/approved" },
      { label: "Rejected Jobs", href: "/admin/jobs/rejected" },
    ],
  },
  {
    label: "Companies",
    href: "/admin/companies",
    icon: HiOutlineBuildingOffice2,
    children: [
      { label: "Pending Review", href: "/admin/companies" },
      { label: "Approved", href: "/admin/companies/approved" },
      { label: "Rejected", href: "/admin/companies/rejected" },
      { label: "Suspended", href: "/admin/companies/suspended" },
    ],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: HiOutlineUsers,
  },
  {
    label: "Community",
    href: "/admin/community",
    icon: HiOutlineChatBubbleLeftRight,
  },
  {
    label: "Support Tickets",
    href: "/admin/support",
    icon: HiOutlineLifebuoy,
  },
];

const SUPER_ADMIN_NAV: NavItem[] = [
  {
    label: "Team",
    href: "/admin/team",
    icon: HiOutlineUserGroup,
  },
];

const AdminSidebar = ({ isMobileOpen, onCloseMobile }: AdminSidebarProps) => {
  const pathname = usePathname();
  const { userProfile } = useUserProfile();
  const isSuper = isSuperAdmin(userProfile);
  const [openGroup, setOpenGroup] = useState<string | null>(() =>
    pathname.startsWith("/admin/jobs") ? "Jobs" : null,
  );

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navItems = isSuper ? [...NAV_ITEMS, ...SUPER_ADMIN_NAV] : NAV_ITEMS;
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-200",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={clsx(
          "fixed lg:sticky top-0 left-0 z-50 lg:z-auto",
          "h-screen w-64 shrink-0",
          "bg-[#0b0b0c] text-gray-300",
          "border-r border-white/5",
          "flex flex-col",
          "transition-transform duration-300 ease-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="Admin navigation"
      >
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/5 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-white/5 ring-1 ring-white/10 overflow-hidden flex items-center justify-center">
              <Image
                src="/images/logo_1.svg"
                alt="Vetriconn"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">Vetriconn</p>
              <p className="text-[11px] text-gray-500 font-medium tracking-wide">
                Admin Console
              </p>
            </div>
          </Link>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            aria-label="Close navigation"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const hasChildren = !!item.children?.length;
            const isGroupOpen = openGroup === item.label;

            if (!hasChildren) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={clsx(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-white shadow-[0_8px_20px_-8px_rgba(229,62,62,0.6)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5",
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <div key={item.label}>
                <button
                  onClick={() =>
                    setOpenGroup(isGroupOpen ? null : item.label)
                  }
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "text-white bg-white/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5",
                  )}
                  aria-expanded={isGroupOpen}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <HiOutlineChevronDown
                    className={clsx(
                      "w-4 h-4 transition-transform text-gray-500",
                      isGroupOpen && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={clsx(
                    "overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
                    isGroupOpen
                      ? "max-h-60 opacity-100 mt-1"
                      : "max-h-0 opacity-0",
                  )}
                >
                  <div className="ml-3 pl-4 border-l border-white/5 space-y-0.5">
                    {item.children!.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onCloseMobile}
                          className={clsx(
                            "block px-3 py-2 rounded-md text-[13px] transition-colors",
                            childActive
                              ? "text-white bg-white/5"
                              : "text-gray-500 hover:text-white hover:bg-white/5",
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            All systems operational
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;

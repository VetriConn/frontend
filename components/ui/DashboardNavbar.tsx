"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlineInbox,
  HiOutlineBell,
  HiOutlineChevronDown,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBookmark,
  HiOutlineCog6Tooth,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
  HiOutlineBuildingOffice2,
  HiOutlinePlusCircle,
  HiOutlineClipboardDocument,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineChatBubbleLeftRight,
  HiOutlineGlobeAlt,
  HiOutlineCreditCard,
} from "react-icons/hi2";
import { getInitials } from "@/lib/initials";
import Image from "next/image";
import { logoutUser } from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useMyCompanies } from "@/hooks/useCompanies";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  hasDropdown?: boolean;
}

// Job seeker navigation
const jobSeekerNavItems: NavItem[] = [
  {
    name: "Find Jobs",
    href: "/dashboard",
    icon: <HiOutlineBriefcase className="w-5 h-5" />,
    hasDropdown: true,
  },
  {
    name: "Community",
    href: "/dashboard/community",
    icon: <HiOutlineUsers className="w-5 h-5" />,
  },
  {
    name: "Inbox",
    href: "/dashboard/inbox",
    icon: <HiOutlineInbox className="w-5 h-5" />,
  },
];

// Employer navigation
const employerNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <HiOutlineBuildingOffice2 className="w-5 h-5" />,
  },
  {
    name: "Jobs",
    href: "/dashboard/postings",
    icon: <HiOutlineBriefcase className="w-5 h-5" />,
    hasDropdown: true,
  },
  {
    name: "Companies",
    href: "/dashboard/companies",
    icon: <HiOutlineBuildingOffice2 className="w-5 h-5" />,
  },
];

/**
 * Shown to employers always, and to job seekers only once they belong to a
 * company — a hiring-team invite can land on any account, regardless of role.
 */
const companiesNavItem: NavItem = {
  name: "Companies",
  href: "/dashboard/companies",
  icon: <HiOutlineBuildingOffice2 className="w-5 h-5" />,
};

const DashboardNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToaster();
  const { userProfile } = useUserProfile();
  const { unreadCount } = useNotifications();
  const { companies } = useMyCompanies();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const jobsDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileMenuItemRef = useRef<HTMLAnchorElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        jobsDropdownRef.current &&
        !jobsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsJobsDropdownOpen(false);
      }
      // Mobile menu backdrop click handled separately
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    // Focus first menu item when menu opens
    setTimeout(() => {
      firstMobileMenuItemRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
        return;
      }

      // Arrow key navigation
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const menuElement = mobileMenuRef.current;
        if (!menuElement) return;

        const focusableElements = menuElement.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        );
        const focusableArray = Array.from(focusableElements);
        const currentIndex = focusableArray.indexOf(
          document.activeElement as HTMLElement,
        );

        if (e.key === "ArrowDown") {
          const nextIndex = (currentIndex + 1) % focusableArray.length;
          focusableArray[nextIndex]?.focus();
        } else {
          const prevIndex =
            currentIndex <= 0 ? focusableArray.length - 1 : currentIndex - 1;
          focusableArray[prevIndex]?.focus();
        }
      }

      // Tab key focus trap
      if (e.key === "Tab") {
        const menuElement = mobileMenuRef.current;
        if (!menuElement) return;

        const focusableElements = menuElement.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast({
        type: "success",
        title: "Logged out successfully",
        description: "Redirecting to homepage...",
      });
      setTimeout(() => router.push("/"), 1500);
    } catch {
      showToast({
        type: "error",
        title: "Logout failed",
        description: "Please try again",
      });
    }
    setIsProfileDropdownOpen(false);
  };

  const isUserProfileLoading = !userProfile;
  const userName = isUserProfileLoading
    ? "Loading..."
    : userProfile?.full_name || "User";
  const isEmployer = userProfile?.role === "employer";
  const isJobSeeker = userProfile?.role === "job_seeker";
  const userRole = isUserProfileLoading
    ? "Loading..."
    : isEmployer
      ? "Employer"
      : "Job Seeker";

  // Get the appropriate avatar/logo based on user role
  const getAvatarUrl = () => {
    if (!userProfile) return null;
    return userProfile.picture || null;
  };

  const avatarUrl = getAvatarUrl();

  const notificationsHref = isEmployer
    ? "/dashboard/notifications"
    : "/dashboard/notifications";

  // Don't render role-specific nav until the profile is confirmed to avoid flash
  const navItems = useMemo(() => {
    if (isUserProfileLoading) return [];
    if (isEmployer) return employerNavItems;
    if (!isJobSeeker) return [];

    // Company invites go to an email address, so a job seeker can end up on a
    // hiring team without ever being an employer. Surface Companies for them
    // once they actually belong to one, rather than cluttering the nav for
    // everyone who never will.
    return companies.length > 0
      ? [...jobSeekerNavItems, companiesNavItem]
      : jobSeekerNavItems;
  }, [isUserProfileLoading, isEmployer, isJobSeeker, companies.length]);
  const hasUnreadNotifications = unreadCount > 0;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 md:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center shrink-0">
          <Image
            src="/images/logo_1.svg"
            alt="Vetriconn"
            width={140}
            height={45}
            priority
            sizes="140px"
          />
        </Link>

        {/* Right Side - All Navigation Items */}
        <div className="hidden md:flex items-center gap-2">
          {/* Center Navigation */}
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              ref={item.hasDropdown ? jobsDropdownRef : undefined}
            >
              {item.hasDropdown ? (
                <button
                  onClick={() => setIsJobsDropdownOpen(!isJobsDropdownOpen)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-primary bg-red-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  <HiOutlineChevronDown
                    className={clsx(
                      "w-4 h-4 transition-transform",
                      isJobsDropdownOpen && "rotate-180",
                    )}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-primary bg-red-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )}
              {/* Dropdown menu - role aware */}
              {item.hasDropdown && isJobsDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                  style={{ minWidth: "200px" }}
                >
                  {isEmployer ? (
                    <>
                      <div className="px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                        Job Management
                      </div>
                      <Link
                        href="/dashboard/post-job"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        <HiOutlinePlusCircle className="w-5 h-5 text-primary" />
                        Post New Job
                      </Link>
                      <Link
                        href="/dashboard/postings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        <HiOutlineDocumentText className="w-5 h-5 text-gray-400" />
                        Manage Job Postings
                      </Link>
                      <Link
                        href="/dashboard/drafts"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        <HiOutlineClipboardDocument className="w-5 h-5 text-gray-400" />
                        Manage Job Drafts
                      </Link>
                      <Link
                        href="/dashboard/applications"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        <HiOutlineUserGroup className="w-5 h-5 text-gray-400" />
                        Applications / Applicants
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        All Jobs
                      </Link>
                      <Link
                        href="/dashboard/saved-jobs"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        Saved Jobs
                      </Link>
                      <Link
                        href="/dashboard/saved-searches"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        Saved Searches
                      </Link>
                      <Link
                        href="/dashboard/applied-jobs"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        Applied Jobs
                      </Link>
                      <Link
                        href="/dashboard/application-drafts"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        Application Drafts
                      </Link>
                      <Link
                        href="/dashboard/find-jobs"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        Browse Jobs
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Notifications */}
          <Link
            href={notificationsHref}
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
              pathname === notificationsHref
                ? "text-primary bg-red-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            )}
          >
            <div className="relative">
              <HiOutlineBell className="w-5 h-5" />
              {hasUnreadNotifications && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
            <span>Notifications</span>
          </Link>

          {/* Messages - Employer only */}
          {isEmployer && (
            <Link
              href="/dashboard/inbox"
              className={clsx(
                "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                pathname === "/dashboard/inbox"
                  ? "text-primary bg-red-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              )}
            >
              <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
              <span>Messages</span>
            </Link>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0"
                style={{ aspectRatio: "1" }}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={userName}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    sizes="40px"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-gray-500 text-sm font-medium">
                    {getInitials(userName)}
                  </span>
                )}
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-tight truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  {userRole}
                </p>
              </div>
              <HiOutlineChevronDown
                className={clsx(
                  "w-4 h-4 text-gray-400 transition-transform shrink-0",
                  isProfileDropdownOpen && "rotate-180",
                )}
              />
            </button>

            {isProfileDropdownOpen && (
              <div
                className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                style={{ minWidth: "200px" }}
              >
                {isEmployer ? (
                  <>
                    <Link
                      href="/dashboard/company-profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineGlobeAlt className="w-5 h-5 text-gray-400" />
                      View Public Company Page
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineCog6Tooth className="w-5 h-5 text-gray-400" />
                      Settings
                    </Link>
                    <Link
                      href="/dashboard/billing"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineCreditCard className="w-5 h-5 text-gray-400" />
                      Billing / Subscription
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-gray-50 w-full text-left"
                    >
                      <HiOutlineArrowRightOnRectangle className="w-5 h-5 text-primary" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineUser className="w-5 h-5 text-gray-400" />
                      View Profile
                    </Link>
                    <Link
                      href="/dashboard/applied-jobs"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineBriefcase className="w-5 h-5 text-gray-400" />
                      Applied Jobs
                    </Link>
                    <Link
                      href="/dashboard/application-drafts"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineClipboardDocument className="w-5 h-5 text-gray-400" />
                      Application Drafts
                    </Link>
                    <Link
                      href="/dashboard/saved-jobs"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineBookmark className="w-5 h-5 text-gray-400" />
                      Saved Jobs
                    </Link>
                    <Link
                      href="/dashboard/saved-searches"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineMagnifyingGlass className="w-5 h-5 text-gray-400" />
                      Saved Searches
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineCog6Tooth className="w-5 h-5 text-gray-400" />
                      Account Settings
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <HiOutlineArrowRightOnRectangle className="w-5 h-5 text-gray-400" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <HiOutlineXMark className="w-6 h-6" />
            ) : (
              <HiOutlineBars3 className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div
        ref={mobileMenuRef}
        className={clsx(
          "fixed top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-xl z-50 md:hidden overflow-y-auto transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="pt-[73px] pb-[73px] px-0">
          {navItems.map((item, index) => (
            <Link
              key={item.name}
              ref={index === 0 ? firstMobileMenuItemRef : undefined}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors min-h-[44px]",
                pathname === item.href
                  ? "text-primary bg-red-50"
                  : "text-gray-700 hover:bg-gray-50",
              )}
              onClick={closeMobileMenu}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          <hr className="my-2 border-gray-100" />

          {/* Employer mobile menu items */}
          {isEmployer ? (
            <>
              <Link
                href="/dashboard/post-job"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlinePlusCircle className="w-5 h-5 text-primary" />
                Post New Job
              </Link>
              <Link
                href="/dashboard/applications"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlineUserGroup className="w-5 h-5 text-gray-400" />
                Applications
              </Link>
              <Link
                href="/dashboard/drafts"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlineClipboardDocument className="w-5 h-5 text-gray-400" />
                Manage Job Drafts
              </Link>
              <Link
                href={notificationsHref}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <div className="relative">
                  <HiOutlineBell className="w-5 h-5" />
                  {hasUnreadNotifications && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
                Notifications
              </Link>
              <Link
                href="/dashboard/inbox"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-gray-400" />
                Messages
              </Link>
              <Link
                href="/dashboard/company-profile"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlineGlobeAlt className="w-5 h-5 text-gray-400" />
                Company Profile
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlineCog6Tooth className="w-5 h-5 text-gray-400" />
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link
                href={notificationsHref}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors min-h-[44px]",
                  pathname === notificationsHref
                    ? "text-primary bg-red-50"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={closeMobileMenu}
              >
                <div className="relative">
                  <HiOutlineBell className="w-5 h-5" />
                  {hasUnreadNotifications && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
                Notifications
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlineUser className="w-5 h-5 text-gray-400" />
                View Profile
              </Link>
              <Link
                href="/dashboard/applied-jobs"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlineBriefcase className="w-5 h-5 text-gray-400" />
                Applied Jobs
              </Link>
              <Link
                href="/dashboard/application-drafts"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlineClipboardDocument className="w-5 h-5 text-gray-400" />
                Application Drafts
              </Link>
              <Link
                href="/dashboard/saved-jobs"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlineBookmark className="w-5 h-5 text-gray-400" />
                Saved Jobs
              </Link>
              <Link
                href="/dashboard/saved-searches"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlineMagnifyingGlass className="w-5 h-5 text-gray-400" />
                Saved Searches
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                onClick={closeMobileMenu}
              >
                <HiOutlineCog6Tooth className="w-5 h-5 text-gray-400" />
                Account Settings
              </Link>
            </>
          )}

          <hr className="my-2 border-gray-100" />
          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left min-h-[44px]"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5 text-gray-400" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;

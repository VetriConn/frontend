"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
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
    icon: <HiOutlineBriefcase className="text-lg" />,
    hasDropdown: true,
  },
  {
    name: "Community",
    href: "/dashboard/community",
    icon: <HiOutlineUsers className="text-lg" />,
  },
  {
    name: "Inbox",
    href: "/dashboard/inbox",
    icon: <HiOutlineInbox className="text-lg" />,
  },
];

// Employer navigation
const employerNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <HiOutlineBuildingOffice2 className="text-lg" />,
  },
  {
    name: "Jobs",
    href: "/dashboard/employer/jobs",
    icon: <HiOutlineBriefcase className="text-lg" />,
    hasDropdown: true,
  },
  {
    name: "Company Profile",
    href: "/dashboard/employer/company-profile",
    icon: <HiOutlineGlobeAlt className="text-lg" />,
  },
];

const DashboardNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToaster();
  const { userProfile } = useUserProfile();
  const { unreadCount } = useNotifications();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const jobsDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
  const userRole = isUserProfileLoading
    ? "Loading..."
    : isEmployer
      ? "Employer"
      : "Job Seeker";

  const navItems = useMemo(
    () => (isEmployer ? employerNavItems : jobSeekerNavItems),
    [isEmployer],
  );
  const hasUnreadNotifications = unreadCount > 0;

  return (
    <nav className="bg-white border-b-[1px] border-gray-200 sticky top-0 z-[100]">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between py-3 px-6 lg:px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center shrink-0">
          <Image
            src="/images/logo_1.svg"
            alt="Vetriconn"
            width={140}
            height={45}
            priority
          />
        </Link>

        {/* Center Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-1">
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
                      "text-xs transition-transform",
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
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] py-1 z-50">
                  {isEmployer ? (
                    <>
                      <div className="px-4 py-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
                        Job Management
                      </div>
                      <Link
                        href="/dashboard/employer/post-job"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        <HiOutlinePlusCircle className="text-primary" />
                        Post New Job
                      </Link>
                      <Link
                        href="/dashboard/employer/jobs"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        <HiOutlineDocumentText className="text-gray-400" />
                        Manage Job Postings
                      </Link>
                      <Link
                        href="/dashboard/employer/applications"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsJobsDropdownOpen(false)}
                      >
                        <HiOutlineUserGroup className="text-gray-400" />
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
                        href="/dashboard/jobs"
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
        </div>

        {/* Right Side - Notifications & Profile */}
        <div className="hidden md:flex items-center gap-3">
          {/* Notifications */}
          <Link
            href="/dashboard/notifications"
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
              pathname === "/dashboard/notifications"
                ? "text-primary bg-red-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            )}
          >
            <div className="relative">
              <HiOutlineBell className="text-lg" />
              {hasUnreadNotifications && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
            <span>Notifications</span>
          </Link>

          {/* Messages - Employer only */}
          {isEmployer && (
            <Link
              href="/dashboard/employer/messages"
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                pathname === "/dashboard/employer/messages"
                  ? "text-primary bg-red-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              )}
            >
              <HiOutlineChatBubbleLeftRight className="text-lg" />
              <span>Messages</span>
            </Link>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {userProfile?.picture ? (
                  <Image
                    src={userProfile.picture}
                    alt={userName}
                    width={36}
                    height={36}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm font-medium">
                    {getInitials(userName)}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  {userRole}
                </p>
              </div>
              <HiOutlineChevronDown
                className={clsx(
                  "text-xs text-gray-400 transition-transform ml-1",
                  isProfileDropdownOpen && "rotate-180",
                )}
              />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] py-1 z-50">
                {isEmployer ? (
                  <>
                    <Link
                      href="/dashboard/employer/company-profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineGlobeAlt className="text-gray-400" />
                      View Public Company Page
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineCog6Tooth className="text-gray-400" />
                      Settings
                    </Link>
                    <Link
                      href="/dashboard/employer/billing"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineCreditCard className="text-gray-400" />
                      Billing / Subscription
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-gray-50 w-full text-left"
                    >
                      <HiOutlineArrowRightOnRectangle className="text-primary" />
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
                      <HiOutlineUser className="text-gray-400" />
                      View Profile
                    </Link>
                    <Link
                      href="/dashboard/applied-jobs"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineBriefcase className="text-gray-400" />
                      Applied Jobs
                    </Link>
                    <Link
                      href="/dashboard/saved-jobs"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineBookmark className="text-gray-400" />
                      Saved Jobs
                    </Link>
                    <Link
                      href="/dashboard/saved-searches"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineMagnifyingGlass className="text-gray-400" />
                      Saved Searches
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <HiOutlineCog6Tooth className="text-gray-400" />
                      Account Settings
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <HiOutlineArrowRightOnRectangle className="text-gray-400" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden relative" ref={mobileMenuRef}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <HiOutlineXMark className="text-xl" />
            ) : (
              <HiOutlineBars3 className="text-xl" />
            )}
          </button>

          {isMobileMenuOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[220px] py-2 z-50">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-primary bg-red-50"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
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
                    href="/dashboard/employer/post-job"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiOutlinePlusCircle className="text-primary" />
                    Post New Job
                  </Link>
                  <Link
                    href="/dashboard/employer/applications"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiOutlineUserGroup className="text-gray-400" />
                    Applications
                  </Link>
                  <Link
                    href="/dashboard/notifications"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="relative">
                      <HiOutlineBell className="text-lg" />
                      {hasUnreadNotifications && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    Notifications
                  </Link>
                  <Link
                    href="/dashboard/employer/messages"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiOutlineChatBubbleLeftRight className="text-gray-400" />
                    Messages
                  </Link>
                  <Link
                    href="/dashboard/employer/company-profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiOutlineGlobeAlt className="text-gray-400" />
                    Company Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiOutlineCog6Tooth className="text-gray-400" />
                    Settings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard/notifications"
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                      pathname === "/dashboard/notifications"
                        ? "text-primary bg-red-50"
                        : "text-gray-700 hover:bg-gray-50",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="relative">
                      <HiOutlineBell className="text-lg" />
                      {hasUnreadNotifications && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    Notifications
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiOutlineUser className="text-gray-400" />
                    View Profile
                  </Link>
                  <Link
                    href="/dashboard/applied-jobs"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiOutlineBriefcase className="text-gray-400" />
                    Applied Jobs
                  </Link>
                  <Link
                    href="/dashboard/saved-jobs"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiOutlineBookmark className="text-gray-400" />
                    Saved Jobs
                  </Link>
                  <Link
                    href="/dashboard/saved-searches"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiOutlineMagnifyingGlass className="text-gray-400" />
                    Saved Searches
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiOutlineCog6Tooth className="text-gray-400" />
                    Account Settings
                  </Link>
                </>
              )}

              <hr className="my-2 border-gray-100" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                <HiOutlineArrowRightOnRectangle className="text-gray-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;

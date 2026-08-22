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

interface NavLink {
  name: string;
  href: string;
  icon?: React.ReactNode;
  /** Renders as a section heading above the link, not as a link itself. */
  heading?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  /**
   * Each item owns its own menu. They used to share one open flag and one
   * body, so opening either showed the same combined list under whichever was
   * clicked — two triggers, one panel.
   */
  dropdown?: NavLink[];
}

// Job seeker navigation
/**
 * One nav for one account. Finding work and posting it are both things the
 * same person does, so both are always here rather than chosen by a role.
 */
const navItemsForEveryone: NavItem[] = [
  {
    name: "Find Jobs",
    href: "/dashboard",
    icon: <HiOutlineBriefcase className="w-5 h-5" />,
    dropdown: [
      { name: "Browse Jobs", href: "/dashboard/find-jobs" },
      { name: "Saved Jobs", href: "/dashboard/saved-jobs" },
      { name: "Saved Searches", href: "/dashboard/saved-searches" },
      { name: "Applied Jobs", href: "/dashboard/applied-jobs" },
      { name: "Application Drafts", href: "/dashboard/application-drafts" },
    ],
  },
  {
    name: "My Postings",
    href: "/dashboard/postings",
    icon: <HiOutlineBuildingOffice2 className="w-5 h-5" />,
    dropdown: [
      {
        name: "Post New Job",
        href: "/dashboard/post-job",
        icon: <HiOutlinePlusCircle className="w-5 h-5 text-primary" />,
      },
      {
        name: "Manage Job Postings",
        href: "/dashboard/postings",
        icon: <HiOutlineDocumentText className="w-5 h-5 text-gray-400" />,
      },
      {
        name: "Manage Job Drafts",
        href: "/dashboard/drafts",
        icon: <HiOutlineClipboardDocument className="w-5 h-5 text-gray-400" />,
      },
      {
        name: "Applicants",
        href: "/dashboard/applications",
        icon: <HiOutlineUserGroup className="w-5 h-5 text-gray-400" />,
      },
    ],
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

/** The account's own things — always visible, at the top. */
const PROFILE_LINKS: NavLink[] = [
  {
    name: "View Profile",
    href: "/dashboard/profile",
    icon: <HiOutlineUser className="w-5 h-5 text-gray-400" />,
  },
  {
    name: "Applied Jobs",
    href: "/dashboard/applied-jobs",
    icon: <HiOutlineBriefcase className="w-5 h-5 text-gray-400" />,
  },
  {
    name: "Application Drafts",
    href: "/dashboard/application-drafts",
    icon: <HiOutlineClipboardDocument className="w-5 h-5 text-gray-400" />,
  },
  {
    name: "Saved Jobs",
    href: "/dashboard/saved-jobs",
    icon: <HiOutlineBookmark className="w-5 h-5 text-gray-400" />,
  },
  {
    name: "Saved Searches",
    href: "/dashboard/saved-searches",
    icon: <HiOutlineMagnifyingGlass className="w-5 h-5 text-gray-400" />,
  },
  {
    name: "Account Settings",
    href: "/dashboard/settings",
    icon: <HiOutlineCog6Tooth className="w-5 h-5 text-gray-400" />,
  },
];

/** Company things, folded away — an account only has these if it joined one. */
const COMPANY_LINKS: NavLink[] = [
  {
    name: "View Public Company Page",
    href: "/dashboard/companies",
    icon: <HiOutlineGlobeAlt className="w-5 h-5 text-gray-400" />,
  },
  {
    name: "Billing / Subscription",
    href: "/dashboard/billing",
    icon: <HiOutlineCreditCard className="w-5 h-5 text-gray-400" />,
  },
];

/** Account-level destinations, listed once each. */
const ACCOUNT_LINKS: NavLink[] = [
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: <HiOutlineBell className="w-5 h-5 text-gray-400" />,
  },
  {
    name: "Messages",
    href: "/dashboard/inbox",
    icon: <HiOutlineInbox className="w-5 h-5 text-gray-400" />,
  },
  {
    name: "Companies",
    href: "/dashboard/companies",
    icon: <HiOutlineBuildingOffice2 className="w-5 h-5 text-gray-400" />,
  },
  {
    name: "View Profile",
    href: "/dashboard/profile",
    icon: <HiOutlineUser className="w-5 h-5 text-gray-400" />,
  },
  {
    name: "Account Settings",
    href: "/dashboard/settings",
    icon: <HiOutlineCog6Tooth className="w-5 h-5 text-gray-400" />,
  },
];

/**
 * Only shown once the account actually belongs to a company, rather than
 * cluttering the nav for everyone who never will. A hiring-team invite goes to
 * an email address, so any account can end up on one.
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
  // Which menu is open, by item name — null when none is. A single boolean
  // meant both triggers drove the same panel.
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isCompanySectionOpen, setIsCompanySectionOpen] = useState(false);
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
        setIsCompanySectionOpen(false);
        setIsProfileDropdownOpen(false);
      }
      // One ref around the whole nav: with a menu per item, a single shared
      // ref only ever pointed at the last one rendered.
      if (
        jobsDropdownRef.current &&
        !jobsDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
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
        description: "Taking you to sign in...",
      });
      // replace, not push: the dashboard is behind auth now, so Back should
      // not return to a page that will only bounce them out again.
      router.replace("/signin");
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
  const userRole = isUserProfileLoading ? "Loading..." : "Member";

  // Get the appropriate avatar/logo based on user role
  const getAvatarUrl = () => {
    if (!userProfile) return null;
    return userProfile.picture || null;
  };

  const avatarUrl = getAvatarUrl();

  const notificationsHref = "/dashboard/notifications";

  // Held back until the profile resolves, so the nav does not flash.
  const navItems = useMemo(() => {
    if (isUserProfileLoading) return [];
    return companies.length > 0
      ? [...navItemsForEveryone, companiesNavItem]
      : navItemsForEveryone;
  }, [isUserProfileLoading, companies.length]);
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
        <div className="hidden md:flex items-center gap-2" ref={jobsDropdownRef}>
          {/* Center Navigation */}
          {navItems.map((item) => (
            <div key={item.name} className="relative">
              {item.dropdown ? (
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === item.name ? null : item.name,
                    )
                  }
                  aria-expanded={openDropdown === item.name}
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
                      openDropdown === item.name && "rotate-180",
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
              {item.dropdown && openDropdown === item.name && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                  style={{ minWidth: "200px" }}
                  role="menu"
                >
                  {item.dropdown.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}
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
                    <>
                      <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Profile
                      </p>
                      {PROFILE_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          {link.icon}
                          {link.name}
                        </Link>
                      ))}

                      <hr className="my-1 border-gray-100" />

                      {/* Folded away by default: most accounts never join a
                          company, and this is their own profile menu. */}
                      <button
                        type="button"
                        onClick={() => setIsCompanySectionOpen((open) => !open)}
                        aria-expanded={isCompanySectionOpen}
                        className="flex items-center justify-between gap-3 w-full px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:bg-gray-50"
                      >
                        For companies
                        <HiOutlineChevronDown
                          className={clsx(
                            "w-4 h-4 transition-transform",
                            isCompanySectionOpen && "rotate-180",
                          )}
                        />
                      </button>

                      {isCompanySectionOpen &&
                        COMPANY_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            {link.icon}
                            {link.name}
                          </Link>
                        ))}

                      <hr className="my-1 border-gray-100" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-red-50 w-full text-left font-medium"
                      >
                        <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                        Sign Out
                      </button>
                    </>
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

          {/* Everything the desktop menus hold, flattened — rendered from the
              same nav definition so the two cannot drift apart. This list was
              maintained by hand and had already lost Browse Jobs, Saved Jobs,
              Saved Searches and Application Drafts, while showing Notifications
              twice. */}
          {navItems
            .filter((item) => item.dropdown)
            .map((item) => (
              <div key={`mobile-${item.name}`}>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-primary uppercase tracking-wider">
                  {item.name}
                </p>
                {item.dropdown?.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                    onClick={closeMobileMenu}
                  >
                    {link.icon ?? <span className="w-5" />}
                    {link.name}
                  </Link>
                ))}
              </div>
            ))}

          <hr className="my-2 border-gray-100" />

          {ACCOUNT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
              onClick={closeMobileMenu}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}

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

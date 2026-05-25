"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  HiOutlineBars3,
  HiOutlineBell,
  HiOutlineChevronDown,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { useUserProfile } from "@/hooks/useUserProfile";
import { logoutUser } from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import { getInitials } from "@/lib/initials";

interface AdminTopBarProps {
  onOpenMobileMenu: () => void;
}

const AdminTopBar = ({ onOpenMobileMenu }: AdminTopBarProps) => {
  const { userProfile } = useUserProfile();
  const { showToast } = useToaster();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast({ type: "success", title: "Logged out" });
      setTimeout(() => router.push("/signin"), 600);
    } catch {
      showToast({ type: "error", title: "Logout failed" });
    }
    setIsMenuOpen(false);
  };

  const name = userProfile?.full_name || "Admin";
  const initials = getInitials(name);
  const avatar = userProfile?.picture || null;

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-200/80">
      <div className="h-16 px-4 md:px-6 lg:px-8 flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Open navigation"
        >
          <HiOutlineBars3 className="w-6 h-6" />
        </button>

        <div className="flex-1" />

        {/* Notifications */}
        <Link
          href="/admin/notifications"
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <HiOutlineBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
        </Link>

        {/* Profile */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-red-700 text-white flex items-center justify-center text-sm font-semibold overflow-hidden ring-2 ring-white shadow-sm"
              style={{ aspectRatio: "1" }}
            >
              {avatar ? (
                <Image
                  src={avatar}
                  alt={name}
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-900">
              Admin
            </span>
            <HiOutlineChevronDown
              className={clsx(
                "w-4 h-4 text-gray-500 transition-transform",
                isMenuOpen && "rotate-180",
              )}
            />
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 animate-fadeIn"
            >
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userProfile?.email}
                </p>
              </div>
              <Link
                href="/admin/settings"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <HiOutlineCog6Tooth className="w-4 h-4 text-gray-500" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4 text-gray-500" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;

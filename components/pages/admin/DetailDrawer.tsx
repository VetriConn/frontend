"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { HiOutlineXMark } from "react-icons/hi2";

/**
 * Right-hand slide-over drawer at 80% width, used for entity detail views on the
 * admin list pages (companies, jobs, …). Stays mounted so it can animate in and
 * out; when closed it's inert (pointer-events-none) behind the page.
 */
const DetailDrawer = ({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={clsx("fixed inset-0 z-50", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={clsx(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          "absolute top-0 right-0 h-full w-[80%] bg-gray-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-4 px-6 h-16 shrink-0 border-b border-gray-200 bg-white">
          <h2 className="text-base font-bold text-gray-900 truncate">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
          >
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{open && children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default DetailDrawer;

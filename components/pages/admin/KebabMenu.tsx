"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { HiOutlineEllipsisVertical } from "react-icons/hi2";

export interface KebabAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

const MENU_WIDTH = 208;

/**
 * Row actions menu (⋮). Portaled to <body> and positioned off the trigger so it
 * overlays the table instead of being clipped by its overflow, and stays pinned
 * on scroll/resize. Shared across the admin list pages.
 */
const KebabMenu = ({
  actions,
  label = "Row actions",
}: {
  actions: KebabAction[];
  label?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCoords({
        top: r.bottom + window.scrollY + 4,
        left: r.right + window.scrollX - MENU_WIDTH, // right-aligned to the ⋮
      });
    };
    place();
    const onDown = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        btnRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (actions.length === 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <HiOutlineEllipsisVertical className="w-5 h-5" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              width: MENU_WIDTH,
              zIndex: 9999,
            }}
            className="rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          >
            {actions.map((a, i) => {
              const Icon = a.icon;
              return (
                <button
                  key={`${a.label}-${i}`}
                  type="button"
                  role="menuitem"
                  disabled={a.disabled}
                  onClick={() => {
                    a.onClick();
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    a.danger
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                  {a.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
};

export default KebabMenu;

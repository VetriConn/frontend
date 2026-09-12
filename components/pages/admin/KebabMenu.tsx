"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

/**
 * The menu's width at normal text, and its floor thereafter.
 *
 * It used to be the whole story: a frozen 208px box whose padding, gap, icon
 * and label are all rem, so at 125% "View public posting" wrapped to two
 * lines inside a box that had not grown. The number stays because the
 * right-alignment maths needs something to subtract, but the box may exceed
 * it.
 */
const MENU_WIDTH = 208;

/**
 * Row actions menu (⋮). Portaled to <body> and positioned off the trigger so it
 * overlays the table instead of being clipped by its overflow, and stays pinned
 * on scroll/resize. Shared across the admin list pages.
 *
 * Keyboard contract (APG menu-button): Enter/Space/ArrowDown open and focus the
 * first item, ArrowUp opens on the last; arrows cycle (skipping disabled),
 * Home/End jump, Escape and Tab close, Escape returns focus to the ⋮. Without
 * this the portal put the items after everything else in the tab order, so the
 * documented keyboard path to row details went nowhere.
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
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Which item receives focus when the menu mounts: first for Enter/Space/
  // ArrowDown, last for ArrowUp.
  const initialIndex = useRef<"first" | "last">("first");

  const enabledIndexes = useCallback(
    () =>
      actions
        .map((a, i) => (a.disabled ? -1 : i))
        .filter((i) => i !== -1),
    [actions],
  );

  const focusItem = useCallback((index: number) => {
    itemRefs.current[index]?.focus();
  }, []);

  const openWith = (position: "first" | "last") => {
    initialIndex.current = position;
    setOpen(true);
  };

  const close = useCallback(
    (refocusTrigger: boolean) => {
      setOpen(false);
      if (refocusTrigger) btnRef.current?.focus();
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCoords({
        top: r.bottom + 4,
        left: r.right - MENU_WIDTH, // right-aligned to the ⋮
      });
    };
    place();

    const enabled = enabledIndexes();
    if (enabled.length > 0) {
      const target =
        initialIndex.current === "last" ? enabled[enabled.length - 1] : enabled[0];
      // Deferred so the portaled items exist before focus moves.
      setTimeout(() => focusItem(target), 0);
    }

    const onDown = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        btnRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
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
  }, [open, enabledIndexes, focusItem, close]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openWith("first");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openWith("last");
    }
    // Enter/Space fall through to the native button click → onClick below.
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const enabled = enabledIndexes();
    if (enabled.length === 0) return;
    const current = itemRefs.current.findIndex(
      (el) => el === document.activeElement,
    );
    const pos = enabled.indexOf(current);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(enabled[(pos + 1) % enabled.length]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(enabled[(pos - 1 + enabled.length) % enabled.length]);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem(enabled[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem(enabled[enabled.length - 1]);
    } else if (e.key === "Tab") {
      // Tab leaves the menu; close it and let focus continue naturally.
      setOpen(false);
    }
  };

  if (actions.length === 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openWith("first"))}
        onKeyDown={handleTriggerKeyDown}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-3 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <HiOutlineEllipsisVertical className="w-5 h-5" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            onKeyDown={handleMenuKeyDown}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              minWidth: MENU_WIDTH,
              width: "max-content",
              maxWidth: "min(20rem, calc(100vw - 2rem))",
              zIndex: 9999,
            }}
            className="rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          >
            {actions.map((a, i) => {
              const Icon = a.icon;
              return (
                <button
                  key={`${a.label}-${i}`}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  disabled={a.disabled}
                  onClick={() => {
                    a.onClick();
                    close(true);
                  }}
                  onMouseEnter={() => focusItem(i)}
                  className={clsx(
                    "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    a.danger
                      ? "text-rose-600 hover:bg-rose-50 focus:bg-rose-50"
                      : "text-gray-700 hover:bg-gray-50 focus:bg-gray-50",
                    "focus:outline-none",
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

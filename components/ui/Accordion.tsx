"use client";
import React, { useId } from "react";
import clsx from "clsx";

/**
 * A disclosure row.
 *
 * Deliberately not a dependency: the accessible behaviour here is a button, an
 * aria-controls pairing and a height transition — roughly the code below —
 * where a headless UI kit would add a package to every bundle that loads a FAQ.
 *
 * The panel animates via `grid-template-rows: 0fr → 1fr`, which transitions to
 * the content's real height without measuring it in JS. The content stays
 * mounted while collapsed so find-in-page, screen readers and crawlers still
 * reach it; `visibility` keeps it out of the tab order.
 */

interface AccordionProps {
  className?: string;
  title: React.ReactNode;
  symbol?: React.ReactNode;
  content?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  className = "",
  title,
  symbol,
  content,
  open,
  onToggle,
  children,
}) => {
  const id = useId();
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;

  return (
    <div
      className={clsx(
        "rounded-20 overflow-hidden mobile:rounded-xl transition-shadow duration-200",
        className,
      )}
    >
      <h3 className="m-0">
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className={clsx(
            "w-full bg-transparent border-none text-left flex items-center justify-between gap-6",
            "py-4 px-8 cursor-pointer text-xl font-medium text-gray-900",
            "transition-colors duration-150 hover:bg-black/[0.03]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset",
            "mobile:py-3.5 mobile:px-5 mobile:text-base mobile:gap-4",
          )}
        >
          <span>{title}</span>
          {/* The indicator turns rather than swapping glyphs, so the control
              reads as one object changing state. */}
          <span
            aria-hidden="true"
            className={clsx(
              "shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
              "text-sm font-bold leading-none",
              "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "motion-reduce:transition-none",
              open
                ? "rotate-180 bg-primary/10 text-primary"
                : "bg-black/[0.04] text-gray-500",
            )}
          >
            {symbol}
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={clsx(
          "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div
          className={clsx(
            "overflow-hidden transition-[opacity,visibility] duration-200",
            "motion-reduce:transition-none",
            open ? "opacity-100 visible" : "opacity-0 invisible",
          )}
        >
          <div
            className={clsx(
              "font-open-sans text-text-muted text-lg leading-relaxed",
              "px-8 pb-6 pt-1 mobile:text-sm mobile:px-5 mobile:pb-4",
            )}
          >
            {content}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

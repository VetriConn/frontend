"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

/**
 * Reveals its children as they enter the viewport, once.
 *
 * Deliberately reuses the theme's existing rise animation rather than adding a
 * second motion language (or a library) — the same 320ms decelerating rise the
 * job lists already use, with the same capped stagger.
 *
 * Reduced motion is handled in CSS, not here: `.reveal-pending` only hides the
 * element under `prefers-reduced-motion: no-preference`, so a visitor who asks
 * for less motion gets the finished layout immediately — and if the observer
 * never runs, nothing is left invisible.
 */
export const Reveal = ({
  children,
  index = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Position among siblings; drives the staggered delay. */
  index?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Elements already on screen at load resolve on the observer's first call,
    // so there's no separate "is it visible yet" branch to keep in sync.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      // Fire a little before the element is fully in view, so the motion has
      // finished by the time it's properly on screen.
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      style={{ "--reveal-index": index } as React.CSSProperties}
      className={clsx(className, shown ? "reveal-on-enter" : "reveal-pending")}
    >
      {children}
    </Tag>
  );
};

export default Reveal;

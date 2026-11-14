"use client";

import { useEffect, useRef, useState } from "react";
import { TERMS_OUTLINE } from "@/lib/terms-content";

/**
 * Floating document outline, in the style of Notion's.
 *
 * Collapsed it is a column of tick marks against the right edge, one per
 * heading, short for a subheading and long for a section, with the reader's
 * current position lit in brand colour. Hovering anywhere on it fades the
 * ticks out and the full outline in, over the page rather than beside it.
 *
 * Why a rail and not a list in the flow: these terms carry 90 headings. A
 * contents block long enough to list them all would be several screens of
 * links before the first word of the document, and one short enough to fit
 * would only name the six sections, which is no help once you are nine
 * screens into Section A and want to know whether you are still in it. The
 * rail answers "where am I" continuously and "where else can I go" on demand,
 * and costs no vertical space either way.
 *
 * It is desktop only. Below xl there is no margin to put it in, so the
 * in-flow contents card at the top of the article carries narrow screens.
 *
 * Keyboard users get it through focus-within: the links keep their place in
 * the tab order while the panel is transparent, so tabbing into the outline
 * reveals it. That is also why the panel is hidden with opacity and
 * pointer-events rather than `display: none`, which would take the links out
 * of the tab order entirely.
 */

/** Distance below the sticky header at which a heading counts as reached. */
const ACTIVE_LINE = 140;

/**
 * Scroll a container just enough to show its active row.
 *
 * Deliberately not `scrollIntoView`, which walks up the ancestor chain and
 * will scroll the page itself when it feels like it. That would be a
 * navigation aid fighting the reader for control of the scroll position,
 * which is the one thing it must never do. offsetTop is measured against the
 * container because the container is positioned.
 */
function revealActive(container: HTMLElement | null) {
  if (!container) return;

  const row = container.querySelector<HTMLElement>('[data-active="true"]');
  if (!row) return;

  const viewTop = container.scrollTop;
  const viewBottom = viewTop + container.clientHeight;
  const rowTop = row.offsetTop;
  const rowBottom = rowTop + row.offsetHeight;

  if (rowTop < viewTop) container.scrollTop = rowTop - 8;
  else if (rowBottom > viewBottom)
    container.scrollTop = rowBottom - container.clientHeight + 8;
}

export default function TermsOutline() {
  const [activeId, setActiveId] = useState(TERMS_OUTLINE[0]?.id ?? "");
  const railRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Resolved once. Ninety getElementById calls per scroll frame is work
    // this does not need to repeat, and the headings do not move.
    const nodes = TERMS_OUTLINE.map((heading) => ({
      id: heading.id,
      el: document.getElementById(heading.id),
    })).filter((node): node is { id: string; el: HTMLElement } => node.el !== null);

    let frame = 0;

    const measure = () => {
      frame = 0;

      // The heading the reader is under is the last one to have crossed the
      // line. The list is in document order, so the first heading still
      // below it ends the search.
      let current = nodes[0]?.id ?? "";
      for (const node of nodes) {
        if (node.el.getBoundingClientRect().top > ACTIVE_LINE) break;
        current = node.id;
      }
      setActiveId(current);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // Both lists hold all 90 headings, so on a short viewport either can be
  // taller than its box. Keep the lit row in view in whichever is showing.
  useEffect(() => {
    revealActive(railRef.current);
    revealActive(panelRef.current);
  }, [activeId]);

  return (
    <div className="group fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      {/* Ticks. Decorative: the real links are in the panel, and announcing
          ninety unlabelled marks to a screen reader helps nobody. Kept
          interactive while transparent so that moving the pointer across the
          rail never drops the hover and flickers the panel shut. */}
      <div
        ref={railRef}
        aria-hidden="true"
        className="relative flex max-h-[78vh] flex-col items-end gap-[5px] overflow-y-auto py-2 pr-1 pl-8 transition-opacity duration-200 [scrollbar-width:none] group-focus-within:opacity-0 group-hover:opacity-0 [&::-webkit-scrollbar]:hidden"
      >
        {TERMS_OUTLINE.map((heading) => (
          <span
            key={heading.id}
            data-active={heading.id === activeId}
            className={[
              "h-[2px] shrink-0 rounded-full transition-colors duration-200",
              heading.level === 2 ? "w-8" : "w-5",
              heading.id === activeId ? "bg-primary" : "bg-gray-300",
            ].join(" ")}
          />
        ))}
      </div>

      <nav
        aria-label="On this page"
        className="pointer-events-none absolute right-0 top-1/2 w-96 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
      >
        <div
          ref={panelRef}
          className="relative max-h-[78vh] overflow-y-auto rounded-xl bg-white/95 p-3 shadow-[0_24px_56px_-16px_rgba(15,23,42,0.22)] ring-1 ring-gray-900/[0.07] backdrop-blur-xl"
        >
          {TERMS_OUTLINE.map((heading) => {
            const active = heading.id === activeId;
            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                data-active={active}
                className={[
                  "block rounded-lg py-2 pr-3 font-open-sans text-[0.875rem] leading-snug transition-colors",
                  heading.level === 2 ? "pl-3 font-semibold" : "pl-7",
                  active
                    ? "bg-primary/[0.08] text-primary"
                    : "text-gray-500 hover:bg-gray-100 hover:text-text",
                ].join(" ")}
              >
                {heading.text}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

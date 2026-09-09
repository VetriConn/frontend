import clsx from "clsx";

/**
 * The small tracked label that sits above a section heading.
 *
 * It does the job the heading used to do badly: naming which part of the site
 * you're in ("FOR JOB SEEKERS", "HOW IT WORKS") so the heading itself is free
 * to say something to the reader instead of labelling itself.
 *
 * Rendered as plain text rather than a heading element — it's a caption for the
 * h2 beneath it, and announcing it separately would just repeat the section
 * name to screen-reader users.
 */
export const Eyebrow = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p
    className={clsx(
      "font-open-sans text-[13px] font-bold uppercase tracking-[0.14em] text-primary mb-3",
      className,
    )}
  >
    {children}
  </p>
);

export default Eyebrow;

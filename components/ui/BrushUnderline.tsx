import clsx from "clsx";

/**
 * A hand-drawn marker stroke under a word.
 *
 * Not `text-decoration: underline` — a CSS underline sits on the baseline at a
 * uniform weight and reads as a hyperlink, which is what made the earlier
 * treatment look clickable. This is a tapered brush shape that starts and ends
 * thin, drawn slightly askew and overshooting the word on both sides the way a
 * marker would.
 *
 * `preserveAspectRatio="none"` lets one path stretch to any word length, so the
 * stroke stays proportional whether it underlines "cook" or "veterans".
 */
export const BrushUnderline = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span className={clsx("relative inline-block whitespace-nowrap", className)}>
    <span className="relative z-10">{children}</span>
    <svg
      viewBox="0 0 200 18"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="absolute left-[-2%] bottom-[-0.12em] w-[105%] h-[0.34em] text-primary pointer-events-none"
    >
      {/* Tapered ribbon: thick through the middle, thin at both ends. */}
      <path
        d="M2 12.5 C60 3.2 140 3.2 198 8.6 C140 16 60 16 2 12.5 Z"
        fill="currentColor"
      />
      {/* A second, lighter pass — the small overshoot a real marker leaves. */}
      <path
        d="M8 15.5 C70 11 150 10.5 194 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  </span>
);

export default BrushUnderline;

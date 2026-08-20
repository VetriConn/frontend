import clsx from "clsx";

/**
 * The job-seeking status badge, defined once.
 *
 * There were two copies of this config — one in ProfileHeader, one in
 * ProfilePreviewDialog — already disagreeing about what `none` should say, and
 * both using emoji as the indicator. Emoji render differently on every
 * platform (Apple draws glossy 3D spheres, Windows and Android flat discs),
 * cannot inherit colour, ignore high-contrast mode, and announce to a screen
 * reader as "large green circle".
 *
 * The dot is a `bg-current` span instead, so it takes the badge's own text
 * colour and follows every theme for free.
 */

/** Mirrors the backend enum on Profile.job_seeking_settings.status exactly. */
export type JobSeekingStatus =
  | "none"
  | "actively_looking"
  | "open_to_opportunities"
  | "open_to_offers"
  | "not_looking";

interface StatusPresentation {
  /** Shown on the badge. Empty for `none`, which renders nothing. */
  label: string;
  /** What the status means, for the settings list. */
  description: string;
  /** Fill, text and border. The dot inherits the text colour from these. */
  className: string;
}

export const JOB_SEEKING_STATUS: Record<JobSeekingStatus, StatusPresentation> =
  {
    none: {
      label: "",
      description: "No status — don't show a badge on my profile",
      className: "",
    },
    actively_looking: {
      label: "Open to Work",
      description: "Actively looking — ready for new opportunities",
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70",
    },
    open_to_opportunities: {
      label: "Open to Opportunities",
      description: "Open to opportunities — happy to hear about roles",
      className: "bg-teal-50 text-teal-700 ring-1 ring-teal-200/70",
    },
    open_to_offers: {
      label: "Open to Offers",
      description: "Open to offers — not actively searching but interested",
      className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/70",
    },
    not_looking: {
      // Muted rather than black. The inactive state should not be the
      // heaviest mark in the set, which is what the ⚫ emoji made it.
      label: "Not Looking",
      description: "Not looking — not seeking opportunities right now",
      className: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
    },
  };

/** The coloured dot. Decorative — the label beside it carries the meaning. */
export const StatusDot = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={clsx(
      "w-1.5 h-1.5 rounded-full bg-current shrink-0",
      className,
    )}
  />
);

interface JobSeekingStatusBadgeProps {
  status: JobSeekingStatus | undefined;
  className?: string;
}

export const JobSeekingStatusBadge = ({
  status,
  className,
}: JobSeekingStatusBadgeProps) => {
  if (!status || status === "none") return null;

  const { label, className: tone } = JOB_SEEKING_STATUS[status];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        tone,
        className,
      )}
    >
      <StatusDot />
      {label}
    </span>
  );
};

export default JobSeekingStatusBadge;

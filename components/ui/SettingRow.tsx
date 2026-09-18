import React from "react";
import clsx from "clsx";

interface SettingRowProps {
  /** The icon that sits in the tinted bubble. Sized by this component. */
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  /** The toggle, button or other control on the right. */
  control?: React.ReactNode;
  /** Extra classes on the outer row, for the one row that opens a section. */
  className?: string;
}

/**
 * A labelled setting with a control beside it.
 *
 * Account Settings wrote this same three-part shape eleven times: a tinted
 * circle holding an icon, a title and description stacked next to it, and a
 * control pushed to the right. Not a coincidence of similar-looking markup,
 * either. Each copy carried the identical five class strings, so changing the
 * bubble size or the gap meant eleven edits, and adding a twelfth row meant
 * copying an existing one and hoping it was the current version.
 *
 * I know because I added the twelfth, for the dashboard tour, by copying the
 * eleventh.
 *
 * The icon is passed rather than named so a caller keeps its own import, and
 * the bubble is applied here so the tint cannot drift between rows.
 */
export function SettingRow({
  icon,
  title,
  description,
  control,
  className,
}: SettingRowProps) {
  return (
    <div className={clsx("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
            {title}
          </h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      {control && <div className="shrink-0 pt-1">{control}</div>}
    </div>
  );
}

/** The icon size every row's bubble expects. */
export const SETTING_ROW_ICON = "w-5 h-5 text-primary";

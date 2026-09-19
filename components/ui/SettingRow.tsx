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
    /*
     * Stacked on a narrow screen, side by side from sm up.
     *
     * The control is shrink-0, so on a phone it kept its full width and the
     * text column collapsed around it. The tour row was the worst case: a
     * "Show me around" button next to a two sentence description squeezed the
     * words down to roughly one per line, which at the largest text setting
     * is most of a screen for one setting.
     */
    <div
      className={clsx(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className,
      )}
    >
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
      {control && (
        // pl-[3.25rem] lines the stacked control up with the text above it,
        // clearing the icon bubble and its gap. It drops away from sm.
        <div className="shrink-0 pl-[3.25rem] sm:pl-0 sm:pt-1">{control}</div>
      )}
    </div>
  );
}

/** The icon size every row's bubble expects. */
export const SETTING_ROW_ICON = "w-5 h-5 text-primary";

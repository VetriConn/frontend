"use client";

import { CHART_MAGNITUDE } from "./chartTokens";

export interface BarListRow {
  key: string | null;
  count: number;
}

/**
 * Ranked magnitude: one measure across categories, biggest first.
 *
 * A horizontal bar list rather than a pie or a donut. These breakdowns have
 * long text labels (referrer hosts, landing paths, route patterns) and often
 * a long tail, both of which a pie handles badly — and comparing angles is
 * harder than comparing bar lengths.
 *
 * Every bar is the same hue because the colour is not carrying information
 * here; the length is. See chartTokens.
 *
 * Bars are drawn as plain divs, not SVG, so the labels are real selectable
 * text that wraps and is read by a screen reader in order.
 */
export default function BarList({
  rows,
  total,
  emptyLabel = "No data in this window",
  nullLabel = "(not set)",
  max = 10,
  valueSuffix,
}: {
  rows: BarListRow[];
  /** Denominator for the share. Defaults to the largest row. */
  total?: number;
  emptyLabel?: string;
  nullLabel?: string;
  max?: number;
  valueSuffix?: string;
}) {
  const shown = rows.slice(0, max);
  if (shown.length === 0) {
    return <p className="text-sm text-gray-500">{emptyLabel}</p>;
  }

  // Scale against the biggest bar so the chart uses its full width, but take
  // the share from the real total so the percentages are honest.
  const largest = Math.max(...shown.map((r) => r.count), 1);
  const denominator = total && total > 0 ? total : largest;

  return (
    <ol className="space-y-2.5">
      {shown.map((row) => {
        const label = row.key && row.key.trim() ? row.key : nullLabel;
        const width = Math.max((row.count / largest) * 100, 1.5);
        const share = Math.round((row.count / denominator) * 100);
        return (
          <li key={label}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span
                className="text-sm text-gray-700 truncate min-w-0"
                title={label}
              >
                {label}
              </span>
              <span className="text-sm tabular-nums text-gray-900 font-semibold shrink-0">
                {row.count.toLocaleString("en-US")}
                {valueSuffix}
                <span className="ml-1.5 font-normal text-gray-500">
                  {share}%
                </span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${width}%`, backgroundColor: CHART_MAGNITUDE }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

"use client";

import { useMemo, useState } from "react";
import { CHART_AXIS_TEXT, CHART_GRID, seriesColour } from "./chartTokens";
import type { TelemetryDaily } from "@/lib/api/telemetry";

interface Point {
  day: string;
  values: Record<string, number>;
  total: number;
}

const W = 760;
const H = 240;
const PAD = { top: 12, right: 12, bottom: 28, left: 44 };

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

/**
 * Daily volume, split by auth state.
 *
 * The backend series is SPARSE: a day with no events of a given auth state
 * has no row at all. Plotting it raw would join Monday to Thursday with a
 * straight line and hide the gap, so every day in the window is filled to
 * zero first.
 *
 * Dates are formatted in UTC on purpose. The backend buckets by UTC day
 * (`$dateToString` on `ts`), so rendering in the reader's zone would shift
 * labels off their buckets for anyone west of Greenwich — which is every
 * Canadian user.
 *
 * One y-axis, never two: the two series are the same measure (event count)
 * and belong on the same scale.
 */
export default function TimeSeries({
  rows,
  label,
}: {
  rows: TelemetryDaily[];
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const { points, keys, peak } = useMemo(() => {
    const byDay = new Map<string, Record<string, number>>();
    const keySet = new Set<string>();
    for (const r of rows) {
      const state = r.auth_state || "unknown";
      keySet.add(state);
      const bucket = byDay.get(r.day) ?? {};
      bucket[state] = (bucket[state] ?? 0) + r.count;
      byDay.set(r.day, bucket);
    }
    const sortedKeys = [...keySet].sort();
    const days = [...byDay.keys()].sort();

    // Fill the gaps so a quiet day reads as zero rather than as no data.
    const filled: string[] = [];
    if (days.length > 0) {
      const cursor = new Date(`${days[0]}T00:00:00Z`);
      const last = new Date(`${days[days.length - 1]}T00:00:00Z`);
      while (cursor <= last) {
        filled.push(cursor.toISOString().slice(0, 10));
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    }

    const pts: Point[] = filled.map((day) => {
      const bucket = byDay.get(day) ?? {};
      const values: Record<string, number> = {};
      let total = 0;
      for (const k of sortedKeys) {
        values[k] = bucket[k] ?? 0;
        total += values[k];
      }
      return { day, values, total };
    });

    const highest = Math.max(1, ...pts.map((p) => Math.max(...Object.values(p.values), 0)));
    return { points: pts, keys: sortedKeys, peak: highest };
  }, [rows]);

  if (points.length === 0) {
    return <p className="text-sm text-gray-500">No {label} in this window.</p>;
  }

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / peak) * innerH;

  // Four gridlines is enough to read a value off; more is chart junk.
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(peak * f));
  const uniqueTicks = [...new Set(ticks)];

  const active = hover === null ? null : points[hover];

  return (
    <div>
      {/* A legend is always present for two or more series, so identity is
          never carried by colour alone. */}
      <div className="flex flex-wrap items-center gap-4 mb-3">
        {keys.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seriesColour(k) }}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-gray-600 capitalize">
              {k}
            </span>
          </span>
        ))}
      </div>

      <div className="relative -mx-1 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[520px] h-auto"
          role="img"
          aria-label={`Daily ${label} by auth state. Table of the same data follows.`}
          onMouseLeave={() => setHover(null)}
        >
          {uniqueTicks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke={CHART_GRID}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y(t) + 4}
                textAnchor="end"
                fontSize={11}
                fill={CHART_AXIS_TEXT}
              >
                {t.toLocaleString("en-US")}
              </text>
            </g>
          ))}

          {/* First and last day only: a label per point collides on a
              90-day window, and the tooltip carries the exact date. */}
          <text x={PAD.left} y={H - 8} fontSize={11} fill={CHART_AXIS_TEXT}>
            {dayLabel(points[0].day)}
          </text>
          {points.length > 1 && (
            <text
              x={W - PAD.right}
              y={H - 8}
              textAnchor="end"
              fontSize={11}
              fill={CHART_AXIS_TEXT}
            >
              {dayLabel(points[points.length - 1].day)}
            </text>
          )}

          {/* A polyline of one point paints nothing, so a window holding a
              single day rendered an empty chart. Draw the dot instead. */}
          {keys.map((k) =>
            points.length === 1 ? (
              <circle
                key={k}
                cx={x(0)}
                cy={y(points[0].values[k])}
                r={4.5}
                fill={seriesColour(k)}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ) : (
              <polyline
                key={k}
                fill="none"
                stroke={seriesColour(k)}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points.map((p, i) => `${x(i)},${y(p.values[k])}`).join(" ")}
              />
            ),
          )}

          {hover !== null && (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              stroke={CHART_AXIS_TEXT}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          {hover !== null &&
            keys.map((k) => (
              <circle
                key={k}
                cx={x(hover)}
                cy={y(points[hover].values[k])}
                r={4.5}
                fill={seriesColour(k)}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}

          {/* Full-height hit strips: the target is the column, not the 2px
              line, so hovering anywhere above a day works. */}
          {points.map((p, i) => (
            <rect
              key={p.day}
              x={i === 0 ? PAD.left : x(i) - innerW / (points.length - 1) / 2}
              y={PAD.top}
              width={
                points.length === 1
                  ? innerW
                  : innerW / (points.length - 1)
              }
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>

        {active && (
          <div className="pointer-events-none absolute top-0 left-0 w-full">
            <div
              data-testid="chart-tooltip"
              className="inline-block rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md"
              style={{
                marginLeft: `${Math.min((x(hover!) / W) * 100, 72)}%`,
              }}
            >
              <p className="text-xs font-semibold text-gray-900 mb-1">
                {dayLabel(active.day)}
              </p>
              {keys.map((k) => (
                <p key={k} className="text-xs text-gray-600 whitespace-nowrap">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: seriesColour(k) }}
                    aria-hidden="true"
                  />
                  <span className="capitalize">{k}</span>{" "}
                  <span className="tabular-nums font-semibold text-gray-900">
                    {active.values[k].toLocaleString("en-US")}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* The same numbers as text, for a screen reader and for anyone who
          cannot separate the two lines by colour. */}
      <details className="mt-3">
        <summary className="text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700">
          View as table
        </summary>
        <div className="mt-2 max-h-56 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="text-gray-500">
              <tr>
                <th className="text-left font-semibold py-1">Day</th>
                {keys.map((k) => (
                  <th key={k} className="text-right font-semibold py-1 capitalize">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {points.map((p) => (
                <tr key={p.day} className="border-t border-gray-100">
                  <td className="py-1 whitespace-nowrap">{dayLabel(p.day)}</td>
                  {keys.map((k) => (
                    <td key={k} className="py-1 text-right tabular-nums">
                      {p.values[k].toLocaleString("en-US")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

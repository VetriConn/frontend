/**
 * Chart colours for the admin surface.
 *
 * The product has one brand hue and a grey scale, which is not a chart
 * palette, so these are declared here rather than invented per chart.
 *
 * Two jobs, two treatments, and the distinction is the whole point:
 *
 *  - MAGNITUDE (top referrers, channels, routes, countries). One measure
 *    compared across categories. These get ONE hue for every bar. Giving
 *    each bar its own colour is the classic mistake: it implies the colours
 *    mean something, and the reader hunts for a legend that cannot exist.
 *  - IDENTITY (the daily series, split authenticated vs anonymous). Two real
 *    series that must stay apart, including for a colourblind reader.
 *
 * The identity pair was validated, not eyeballed: worst adjacent separation
 * ΔE 34.0 under protanopia, 31.1 under tritanopia, 39.8 at normal vision,
 * both inside the lightness band and over 3:1 against a white surface.
 *
 * Brand red is deliberately absent. It means "error" everywhere else in this
 * product — see the focus-ring reasoning in globals.css — and a red series
 * in an analytics chart reads as a problem rather than as a category.
 */

/** Every bar in a magnitude chart. One hue, on purpose. */
export const CHART_MAGNITUDE = "#4f46e5";

/** The two auth states, the only place this surface has real series identity. */
export const CHART_SERIES: Record<string, string> = {
  authenticated: "#4f46e5",
  anonymous: "#d97706",
};

/** Anything the backend reports that is not one of the two known states. */
export const CHART_SERIES_FALLBACK = "#6b7280";

export const seriesColour = (key: string): string =>
  CHART_SERIES[key] ?? CHART_SERIES_FALLBACK;

/** Recessive grid and axis ink, so the data stays the loudest thing. */
export const CHART_GRID = "#e5e7eb";
export const CHART_AXIS_TEXT = "#6b7280";

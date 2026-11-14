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
 * These are the Vetriconn red, by product decision. I had argued for keeping
 * red out of the charts, because it means "error" everywhere else here — see
 * the focus-ring reasoning in globals.css — and a red series can read as a
 * problem rather than a category. That was overruled in favour of the brand
 * reading as the brand, which is a reasonable call on a page where nothing
 * is a status: every number here is a quantity, and the only two colours
 * present are a legend-named pair.
 *
 * The pair is validated, not eyeballed. With #c53030 fixed as one series the
 * partner had to be re-checked against it rather than kept: worst adjacent
 * separation ΔE 29.1 under protanopia, 32.4 under tritanopia, 35.3 at normal
 * vision, both inside the lightness band and over 3:1 on white. The obvious
 * grey partners fail — #4b5563 and #1f2937 both drop under the chroma floor
 * and read as grey rather than as a series.
 */

/** Every bar in a magnitude chart. One hue, on purpose. */
export const CHART_MAGNITUDE = "#c53030";

/** The two auth states, the only place this surface has real series identity. */
export const CHART_SERIES: Record<string, string> = {
  authenticated: "#c53030",
  anonymous: "#2563eb",
};

/** Anything the backend reports that is not one of the two known states. */
export const CHART_SERIES_FALLBACK = "#6b7280";

export const seriesColour = (key: string): string =>
  CHART_SERIES[key] ?? CHART_SERIES_FALLBACK;

/** Recessive grid and axis ink, so the data stays the loudest thing. */
export const CHART_GRID = "#e5e7eb";
export const CHART_AXIS_TEXT = "#6b7280";

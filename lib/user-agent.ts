/**
 * Turning a user agent string into something a support agent can read.
 *
 * This lives apart from the admin page that renders it because it is the kind
 * of function that fails quietly: every wrong answer is a plausible-looking
 * browser name, so a regression reads as normal output and only a test
 * notices. It had five separate wrong answers before it had any.
 */

/**
 * Browsers, most specific first.
 *
 * Order is the whole point, and it cannot be expressed as one alternation: a
 * regex matches at the leftmost position, not by alternation preference, and
 * every Edge and Opera user agent puts `Chrome/` ahead of its own `Edg/` or
 * `OPR/`. A single `(Edg|OPR|Chrome|...)` therefore reports both as Chrome
 * however the alternatives are ordered. Running the patterns in sequence and
 * stopping at the first hit is what actually encodes the precedence.
 *
 * Safari reads `Version/`, not `Safari/` — the latter is the WebKit build, so
 * Safari 17.4 announces "Safari/605.1.15" and would be reported as version
 * 605. CriOS and FxiOS are Chrome and Firefox on iOS, which carry no
 * `Chrome/` or `Firefox/` token at all.
 */
const BROWSERS: [name: string, pattern: RegExp][] = [
  ["Edge", /\bEdg(?:e|A|iOS)?\/(\d+)/],
  ["Opera", /\bOPR\/(\d+)/],
  ["Firefox", /\b(?:Firefox|FxiOS)\/(\d+)/],
  ["Samsung Internet", /\bSamsungBrowser\/(\d+)/],
  ["Chrome", /\b(?:Chrome|CriOS)\/(\d+)/],
  ["Safari", /\bVersion\/(\d+)[\d.]*(?: Mobile\/\S+)? Safari\//],
];

/**
 * Platforms, most specific first, for the same reason: an iOS user agent
 * contains the literal "like Mac OS X", so testing for Mac first reports
 * every iPhone as a desktop. Android contains "Linux" for the same reason.
 */
const PLATFORMS: [name: string, pattern: RegExp][] = [
  ["iOS", /\b(?:iPhone|iPad|iPod)\b/],
  ["Android", /\bAndroid\b/],
  ["Windows", /\bWindows\b/],
  ["macOS", /\b(?:Macintosh|Mac OS X)\b/],
  ["Linux", /\bLinux\b/],
];

const firstMatch = (
  candidates: [string, RegExp][],
  agent: string,
): [string, RegExpExecArray] | undefined => {
  for (const [name, pattern] of candidates) {
    const hit = pattern.exec(agent);
    if (hit) return [name, hit];
  }
  return undefined;
};

/**
 * "Chrome 120 on macOS", or as much of it as the string supports.
 *
 * Returns "" for a missing or unrecognisable agent rather than guessing.
 * A bare platform ("Windows") is returned when nothing identifies the
 * browser, since half an answer still narrows a support question.
 */
export const describeAgent = (agent?: string): string => {
  if (!agent) return "";
  const platform = firstMatch(PLATFORMS, agent)?.[0] ?? "";
  const browser = firstMatch(BROWSERS, agent);
  if (!browser) return platform;
  const [name, hit] = browser;
  const version = hit[1] ? ` ${hit[1]}` : "";
  return `${name}${version}${platform ? ` on ${platform}` : ""}`;
};

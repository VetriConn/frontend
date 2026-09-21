import { describeAgent } from "@/lib/user-agent";

/**
 * Real user agent strings, because the bugs this covers all came from the
 * shape of real ones: Edge and Opera carry Chrome's token, Safari reports a
 * WebKit build under `Safari/`, and every iOS device claims "like Mac OS X".
 * Hand-simplified strings would have passed the broken version.
 */
const AGENTS = {
  safariMac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  edgeWindows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  chromeLinux:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  operaWindows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
  firefoxWindows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  safariIphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  chromeIphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1",
  firefoxIphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/123.0 Mobile/15E148 Safari/605.1.15",
  chromeAndroid:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  samsungAndroid:
    "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
  safariIpad:
    "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
};

describe("describeAgent", () => {
  it("names the browser and the platform", () => {
    expect(describeAgent(AGENTS.chromeLinux)).toBe("Chrome 120 on Linux");
    expect(describeAgent(AGENTS.firefoxWindows)).toBe("Firefox 121 on Windows");
    expect(describeAgent(AGENTS.chromeAndroid)).toBe("Chrome 120 on Android");
  });

  // Every Edge and Opera user agent contains "Chrome/" BEFORE its own token,
  // and a regex matches leftmost-first, so a single alternation reports both
  // as Chrome no matter how the alternatives are ordered.
  it("does not mistake Chromium-based browsers for Chrome", () => {
    expect(describeAgent(AGENTS.edgeWindows)).toBe("Edge 120 on Windows");
    expect(describeAgent(AGENTS.operaWindows)).toBe("Opera 106 on Windows");
    expect(describeAgent(AGENTS.samsungAndroid)).toBe(
      "Samsung Internet 23 on Android",
    );
  });

  // "Safari/605.1.15" is the WebKit build, not the browser version.
  it("reports Safari's own version, not its WebKit build", () => {
    expect(describeAgent(AGENTS.safariMac)).toBe("Safari 17 on macOS");
  });

  // Every iOS user agent contains the literal "like Mac OS X", so checking
  // for Mac before iPhone reports every phone as a desktop.
  it("does not report iOS devices as macOS", () => {
    expect(describeAgent(AGENTS.safariIphone)).toBe("Safari 17 on iOS");
    expect(describeAgent(AGENTS.safariIpad)).toBe("Safari 17 on iOS");
  });

  // iOS browsers ship WebKit under their own token and carry no Chrome/ or
  // Firefox/ string at all.
  it("recognises the iOS wrappers of other browsers", () => {
    expect(describeAgent(AGENTS.chromeIphone)).toBe("Chrome 120 on iOS");
    expect(describeAgent(AGENTS.firefoxIphone)).toBe("Firefox 123 on iOS");
  });

  it("says nothing rather than guessing", () => {
    expect(describeAgent(undefined)).toBe("");
    expect(describeAgent("")).toBe("");
    expect(describeAgent("curl/8.4.0")).toBe("");
  });

  it("falls back to the platform when the browser is unrecognisable", () => {
    expect(describeAgent("SomeBot/1.0 (Windows NT 10.0)")).toBe("Windows");
  });
});

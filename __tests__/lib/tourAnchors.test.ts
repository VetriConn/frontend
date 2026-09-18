/**
 * The tour's anchor resolver.
 *
 * Every nav entry is rendered twice, in the desktop bar and in the drawer, and
 * both copies carry the same `data-tour` id. Which one is painted depends on a
 * breakpoint that moves: the navbar switches from `lg` to `xl` whenever the
 * text setting is not "normal", and a media query cannot detect that because
 * `rem` in a media query resolves against the browser's initial 16px.
 *
 * So the resolver asks the DOM which copy is visible rather than reasoning
 * about widths. These tests pin that, including the case that actually breaks
 * things: the element exists but is inside the closed drawer.
 *
 * jsdom gives every element an empty `getClientRects()`, so visibility is
 * stubbed per element here. That is the honest shape of the test: the
 * production check is `getClientRects().length > 0`, and what is being pinned
 * is the branching around it, not jsdom's layout engine.
 */
import {
  anchorExists,
  findVisible,
  isDrawerOpen,
  resolveAnchor,
  MENU_TOGGLE_ID,
} from "@/lib/tour/anchors";

function el(id: string, visible: boolean): HTMLElement {
  const node = document.createElement("div");
  node.setAttribute("data-tour", id);
  // configurable: a test that opens the drawer needs to flip this element
  // from hidden to painted, and a non-configurable property makes that
  // redefinition throw inside the click listener, where it is swallowed.
  Object.defineProperty(node, "getClientRects", {
    configurable: true,
    value: () => (visible ? [{ width: 10, height: 10 }] : []),
  });
  document.body.appendChild(node);
  return node;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("findVisible", () => {
  it("returns null when the id is nowhere in the document", () => {
    expect(findVisible("nav-companies")).toBeNull();
  });

  it("picks the painted copy when both layouts render the same id", () => {
    const hidden = el("nav-inbox", false);
    const shown = el("nav-inbox", true);
    expect(findVisible("nav-inbox")).toBe(shown);
    expect(findVisible("nav-inbox")).not.toBe(hidden);
  });

  it("returns null when every copy is hidden", () => {
    el("nav-inbox", false);
    el("nav-inbox", false);
    expect(findVisible("nav-inbox")).toBeNull();
  });
});

describe("resolveAnchor", () => {
  it("resolves directly when a copy is already painted", async () => {
    const shown = el("nav-find-jobs", true);
    await expect(resolveAnchor("nav-find-jobs")).resolves.toBe(shown);
  });

  it("returns null for an anchor that does not exist for this account", async () => {
    // An account with no company has no nav-companies element at all. That is
    // a dropped step, not an error.
    el(MENU_TOGGLE_ID, true);
    await expect(resolveAnchor("nav-companies")).resolves.toBeNull();
  });

  it("does NOT open the drawer itself", async () => {
    // It used to. That click was the piece fighting the drawer's own state:
    // the provider then closed the drawer after resolving, hiding every
    // anchor it had just found, and on a phone the tour came apart. The tour
    // now asks the reader to open the menu as its own step, and the resolver
    // only reports what it can see.
    el("nav-inbox", false);
    const toggle = el(MENU_TOGGLE_ID, true);
    toggle.setAttribute("aria-expanded", "false");
    const onClick = jest.fn();
    toggle.addEventListener("click", onClick);

    await expect(resolveAnchor("nav-inbox")).resolves.toBeNull();
    expect(onClick).not.toHaveBeenCalled();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("resolves once the drawer is open", async () => {
    const shown = el("nav-inbox", true);
    const toggle = el(MENU_TOGGLE_ID, true);
    toggle.setAttribute("aria-expanded", "true");
    await expect(resolveAnchor("nav-inbox")).resolves.toBe(shown);
  });

  it("does not re-click a drawer that is already open", async () => {
    const hidden = el("nav-inbox", false);
    const toggle = el(MENU_TOGGLE_ID, true);
    toggle.setAttribute("aria-expanded", "true");
    const onClick = jest.fn();
    toggle.addEventListener("click", onClick);

    await expect(resolveAnchor("nav-inbox")).resolves.toBeNull();
    expect(onClick).not.toHaveBeenCalled();
    void hidden;
  });

  it("does not hang when the tab is hidden and rAF never fires", async () => {
    // Found in a real browser, not by reading the code: the preview tab was
    // backgrounded, document.visibilityState was "hidden", and
    // requestAnimationFrame never fired. The await on it never settled, so
    // the tour hung mid-start with the nav drawer stuck open and nothing on
    // screen. Opening the dashboard in a background tab is ordinary, so this
    // is a real path, and it fails as a timeout rather than an error, which
    // is the kind of bug that survives a code review.
    const hidden = el("nav-inbox", false);
    const toggle = el(MENU_TOGGLE_ID, true);
    toggle.setAttribute("aria-expanded", "false");

    const realRaf = window.requestAnimationFrame;
    // A rAF that registers the callback and never calls it, which is exactly
    // what a hidden tab does.
    window.requestAnimationFrame = ((): number =>
      0) as typeof window.requestAnimationFrame;
    try {
      await expect(resolveAnchor("nav-inbox")).resolves.toBeNull();
    } finally {
      window.requestAnimationFrame = realRaf;
    }
    void hidden;
  });

  it("gives up rather than throwing when there is no drawer to open", async () => {
    el("nav-inbox", false);
    await expect(resolveAnchor("nav-inbox")).resolves.toBeNull();
  });
});

describe("anchorExists and isDrawerOpen", () => {
  it("anchorExists sees a hidden anchor, unlike findVisible", () => {
    // Step resolution relies on this. On a drawer layout every nav anchor is
    // hidden when the tour starts, so resolving by visibility dropped all of
    // them and left a one-step tour.
    el("nav-inbox", false);
    expect(findVisible("nav-inbox")).toBeNull();
    expect(anchorExists("nav-inbox")).toBe(true);
  });

  it("anchorExists is false for an account that lacks the feature", () => {
    expect(anchorExists("nav-companies")).toBe(false);
  });

  it("isDrawerOpen reads the toggle rather than the navbar's state", () => {
    const toggle = el(MENU_TOGGLE_ID, true);
    toggle.setAttribute("aria-expanded", "false");
    expect(isDrawerOpen()).toBe(false);
    toggle.setAttribute("aria-expanded", "true");
    expect(isDrawerOpen()).toBe(true);
  });
});

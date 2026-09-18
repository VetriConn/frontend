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
  findVisible,
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

  it("opens the drawer when the only copy is hidden inside it", async () => {
    const hidden = el("nav-inbox", false);
    const toggle = el(MENU_TOGGLE_ID, true);
    toggle.setAttribute("aria-expanded", "false");

    // Opening the drawer is what makes the copy paintable.
    toggle.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "true");
      Object.defineProperty(hidden, "getClientRects", {
        configurable: true,
        value: () => [{ width: 10, height: 10 }],
      });
    });

    await expect(resolveAnchor("nav-inbox")).resolves.toBe(hidden);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
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

  it("gives up rather than throwing when there is no drawer to open", async () => {
    el("nav-inbox", false);
    await expect(resolveAnchor("nav-inbox")).resolves.toBeNull();
  });
});

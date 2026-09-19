/**
 * Which steps a tour decides to run, and why that is a correctness question.
 *
 * The tour resolves its list once, at start, and drops any step whose anchor
 * it cannot find. That makes step selection the place where bugs land
 * silently: a dropped step is indistinguishable from a step that was never
 * meant for this account, so nothing looks broken. Two shipped bugs came from
 * exactly here.
 *
 * The first: resolution used VISIBILITY. On a phone every nav anchor is
 * inside a shut drawer, so all of them resolved to nothing and the tour
 * collapsed to a single step. It now resolves on EXISTENCE, which is the
 * question actually being asked, namely does this account have the feature.
 *
 * The second: the final step was silently dropped at every drawer width for
 * weeks, because the drawer had no anchor for it. The giveaway was the step
 * counter reading "1 of 4" when it should have said 5, which is why the count
 * is asserted here and not just the presence of steps.
 */
import React from "react";
import { render, screen, act, within } from "@testing-library/react";
import { TourProvider, useTour } from "@/components/tour/TourProvider";
import { MENU_TOGGLE_ID } from "@/lib/tour/anchors";

jest.mock("@/lib/api/tour", () => ({ markTourCompleted: jest.fn() }));

/** jsdom has no layout, so visibility is stubbed per element. */
function anchor(id: string, visible: boolean) {
  const node = document.createElement("div");
  node.setAttribute("data-tour", id);
  Object.defineProperty(node, "getClientRects", {
    configurable: true,
    value: () => (visible ? [{ width: 10, height: 10 }] : []),
  });
  document.body.appendChild(node);
  return node;
}

function Starter() {
  const { start } = useTour();
  return (
    <button onClick={() => start("settings")} data-testid="go">
      go
    </button>
  );
}

function renderTour() {
  return render(
    <TourProvider>
      <Starter />
    </TourProvider>,
  );
}

/**
 * "Step 2 of 5" becomes 5.
 *
 * Read from the popover specifically. The provider also mounts a live region
 * carrying the same sentence for screen readers, so an unscoped query finds
 * two matches and throws.
 */
function totalSteps(): number {
  const dialog = screen.getByRole("dialog");
  const label = within(dialog).getByText(/Step \d+ of \d+/).textContent ?? "";
  return Number(label.match(/of (\d+)/)?.[1]);
}

/** The popover's own copy of a string, not the live region's. */
function inDialog(text: RegExp | string) {
  return within(screen.getByRole("dialog")).getByText(text);
}

afterEach(() => {
  document.body.innerHTML = "";
  jest.clearAllMocks();
});

describe("step resolution", () => {
  it("keeps steps whose anchor exists but is hidden inside the shut drawer", async () => {
    // The mobile case. Every nav anchor present, none painted, plus the
    // toggle. Resolving on visibility here produced a one step tour.
    anchor("nav-find-jobs", false);
    anchor("nav-postings", false);
    anchor("nav-inbox", false);
    anchor("nav-account", false);
    anchor(MENU_TOGGLE_ID, true);

    renderTour();
    await act(async () => {
      screen.getByTestId("go").click();
    });

    // welcome, open the menu, and the four nav anchors above.
    expect(totalSteps()).toBe(6);
  });

  it("drops only the steps this account genuinely lacks", async () => {
    // A desktop account with no company: nav-companies is absent from the
    // document entirely, which is the one case worth dropping.
    anchor("nav-find-jobs", true);
    anchor("nav-postings", true);
    anchor("nav-inbox", true);
    anchor("nav-account", true);

    renderTour();
    await act(async () => {
      screen.getByTestId("go").click();
    });

    // welcome plus the four present anchors. No open-the-menu step, because
    // there is no drawer toggle on screen.
    expect(totalSteps()).toBe(5);
  });

  it("includes the company step once the account has one", async () => {
    anchor("nav-find-jobs", true);
    anchor("nav-postings", true);
    anchor("nav-inbox", true);
    anchor("nav-account", true);
    anchor("nav-companies", true);

    renderTour();
    await act(async () => {
      screen.getByTestId("go").click();
    });

    expect(totalSteps()).toBe(6);
  });

  it("omits the open-the-menu step when there is no drawer", async () => {
    anchor("nav-inbox", true);

    renderTour();
    await act(async () => {
      screen.getByTestId("go").click();
    });

    expect(within(screen.getByRole("dialog")).queryByText("Open the menu")).toBeNull();
  });

  it("offers the open-the-menu step when the nav is a drawer", async () => {
    anchor("nav-inbox", false);
    anchor(MENU_TOGGLE_ID, true);

    renderTour();
    await act(async () => {
      screen.getByTestId("go").click();
    });

    // It is step 2, straight after the welcome, so the rest of the tour has
    // something to point at.
    const next = screen.getByRole("button", { name: /next/i });
    await act(async () => {
      next.click();
    });
    expect(inDialog("Open the menu")).toBeTruthy();
  });

  it("waits on the reader rather than showing Next on that step", async () => {
    anchor("nav-inbox", false);
    anchor(MENU_TOGGLE_ID, true);

    renderTour();
    await act(async () => {
      screen.getByTestId("go").click();
    });
    await act(async () => {
      screen.getByRole("button", { name: /next/i }).click();
    });

    expect(inDialog("Open the menu")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^next$/i })).toBeNull();
    expect(inDialog(/waiting for you/i)).toBeTruthy();
  });
});

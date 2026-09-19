/**
 * The step that waits on the reader must not depend on a timer.
 *
 * "Open the menu" ends when the drawer opens, and the first implementation
 * polled `isDrawerOpen()` every 120ms. That looks fine and is not: browsers
 * clamp `setInterval` in a tab that is not being painted, to one second at
 * first and to once a minute after the tab has been hidden a while. A tour
 * left on this step then sits there long after the menu is open.
 *
 * It is also how an afternoon was lost. The stall was reproduced in a
 * headless browser and chased through three wrong theories before
 * `document.hidden` turned out to be true the whole time: the product was
 * fine and the harness was throttled. The fix is to watch the DOM instead of
 * asking it on a schedule.
 *
 * So the assertion here is specifically that the step advances with fake
 * timers installed and never advanced. If someone puts the poll back, every
 * other tour test still passes and this one fails.
 */
import React from "react";
import { render, screen, act, within } from "@testing-library/react";
import { TourProvider, useTour } from "@/components/tour/TourProvider";
import { MENU_TOGGLE_ID } from "@/lib/tour/anchors";

jest.mock("@/lib/api/tour", () => ({ markTourCompleted: jest.fn() }));

/** jsdom has no layout, so visibility is stubbed per element. */
function anchor(id: string, visible = true) {
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

const stepLabel = () =>
  within(screen.getByRole("dialog")).getByText(/Step \d+ of \d+/).textContent ?? "";

const clickInDialog = async (name: RegExp) => {
  const dialog = screen.getByRole("dialog");
  await act(async () => {
    within(dialog).getByRole("button", { name }).click();
  });
};

describe("a step that waits on the reader", () => {
  let toggle: HTMLElement;

  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = "";
    // A drawer layout: the toggle is on screen and the drawer is shut.
    toggle = anchor(MENU_TOGGLE_ID);
    toggle.setAttribute("aria-expanded", "false");
    for (const id of ["nav-find-jobs", "nav-postings", "nav-inbox", "nav-account"]) {
      anchor(id, false);
    }
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("advances the moment the drawer opens, with no timer run", async () => {
    render(
      <TourProvider>
        <Starter />
      </TourProvider>,
    );

    await act(async () => {
      screen.getByTestId("go").click();
    });
    await clickInDialog(/next/i);

    expect(stepLabel()).toMatch(/^Step 2 /);
    expect(screen.getByText(/Waiting for you/)).toBeInTheDocument();

    // The reader taps the menu. Nothing advances the clock afterwards: if the
    // implementation needs its interval, this test fails.
    await act(async () => {
      toggle.setAttribute("aria-expanded", "true");
    });

    expect(stepLabel()).toMatch(/^Step 3 /);
    expect(screen.queryByText(/Waiting for you/)).not.toBeInTheDocument();
  });

  it("does not advance while the drawer is still shut", async () => {
    render(
      <TourProvider>
        <Starter />
      </TourProvider>,
    );

    await act(async () => {
      screen.getByTestId("go").click();
    });
    await clickInDialog(/next/i);
    expect(stepLabel()).toMatch(/^Step 2 /);

    // An unrelated mutation runs the predicate and must not satisfy it.
    await act(async () => {
      document.body.appendChild(document.createElement("span"));
      jest.advanceTimersByTime(5000);
    });

    expect(stepLabel()).toMatch(/^Step 2 /);
  });
});

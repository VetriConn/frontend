/**
 * "Your account is ready", and what happens next.
 *
 * Verification used to say "Redirecting to sign in page…" and then push to
 * /auth/welcome instead — the copy named one destination and the router went
 * to another, so the screen that appeared was a surprise. The panel is
 * rendered where the verification happens now, and it goes where it says.
 */

import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AccountReadyPanel } from "@/components/pages/auth/AccountReadyPanel";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  replace.mockClear();
  sessionStorage.clear();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

/**
 * One second at a time.
 *
 * The countdown schedules the next timeout from an effect that runs after
 * the state update, so advancing several seconds in one call fires only the
 * first — the rest are not scheduled yet. Stepping lets React re-render and
 * arm the next one between ticks, which is also what really happens.
 */
const tick = (seconds: number) => {
  for (let i = 0; i < seconds; i++) {
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  }
};

describe("AccountReadyPanel", () => {
  it("says the account is ready and what it can do", () => {
    render(<AccountReadyPanel />);
    expect(screen.getByText(/you're all set/i)).toBeInTheDocument();
    expect(screen.getByText(/browse roles matched to your experience/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to your account/i })).toBeInTheDocument();
  });

  it("stays put when no countdown is asked for", () => {
    // A bookmarked visit is not the end of a flow; moving on its own would
    // be hostile rather than helpful.
    render(<AccountReadyPanel />);
    tick(30);
    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByText(/taking you there/i)).not.toBeInTheDocument();
  });

  it("counts down out loud rather than moving without warning", () => {
    render(<AccountReadyPanel redirectAfter={5} />);
    expect(screen.getByText(/taking you there in 5 seconds/i)).toBeInTheDocument();
    tick(1);
    expect(screen.getByText(/taking you there in 4 seconds/i)).toBeInTheDocument();
    tick(3);
    expect(screen.getByText(/taking you there in 1 second…/i)).toBeInTheDocument();
  });

  it("goes to sign in when the countdown runs out", () => {
    render(<AccountReadyPanel redirectAfter={5} />);
    expect(replace).not.toHaveBeenCalled();
    tick(5);
    // replace, not push: Back should not return to a verification link that
    // has already been spent.
    expect(replace).toHaveBeenCalledWith("/signin");
  });

  it("offers a way to go immediately", () => {
    render(<AccountReadyPanel redirectAfter={5} />);
    expect(screen.getByRole("link", { name: /sign in to your account/i })).toHaveAttribute(
      "href",
      "/signin",
    );
  });

  it("greets by first name when the signup left one behind", () => {
    sessionStorage.setItem(
      "vetriconn_signup_wizard_state",
      JSON.stringify({ formData: { full_name: "Wisdom Adele" } }),
    );
    render(<AccountReadyPanel />);
    expect(screen.getByText("You're all set, Wisdom!")).toBeInTheDocument();
    // And the half-finished signup is cleared, since it is finished.
    expect(sessionStorage.getItem("vetriconn_signup_wizard_state")).toBeNull();
  });

  it("survives a malformed session payload", () => {
    sessionStorage.setItem("vetriconn_signup_wizard_state", "{not json");
    render(<AccountReadyPanel />);
    expect(screen.getByText("You're all set to get started!")).toBeInTheDocument();
  });
});

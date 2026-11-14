/**
 * Tests for the beacon mount point.
 *
 * It sits in the root layout, on every page, so the contract is narrow:
 * render nothing, fire once, and never let a failure reach the tree.
 */

import { render } from "@testing-library/react";
import VisitBeacon from "@/components/providers/VisitBeacon";
import { sendVisitBeacon } from "@/lib/telemetry";

jest.mock("@/lib/telemetry", () => ({
  __esModule: true,
  sendVisitBeacon: jest.fn(),
}));

const mockedSend = sendVisitBeacon as jest.MockedFunction<typeof sendVisitBeacon>;

describe("VisitBeacon", () => {
  beforeEach(() => mockedSend.mockReset());

  it("renders nothing into the page", () => {
    const { container } = render(<VisitBeacon />);
    expect(container).toBeEmptyDOMElement();
  });

  it("sends the beacon on mount", () => {
    render(<VisitBeacon />);
    expect(mockedSend).toHaveBeenCalledTimes(1);
  });

  it("does not send again on re-render", () => {
    const { rerender } = render(<VisitBeacon />);
    rerender(<VisitBeacon />);
    rerender(<VisitBeacon />);
    expect(mockedSend).toHaveBeenCalledTimes(1);
  });

  // The guard lives in sendVisitBeacon, so a second mount calling through
  // is correct here; the session check is what stops a second request.
  it("delegates the once-per-session decision rather than guarding locally", () => {
    const { unmount } = render(<VisitBeacon />);
    unmount();
    render(<VisitBeacon />);
    expect(mockedSend).toHaveBeenCalledTimes(2);
  });
});

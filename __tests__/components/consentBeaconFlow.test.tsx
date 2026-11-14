/**
 * Integration: the banner and the beacon together.
 *
 * The join between them is easy to get subtly wrong. If the beacon only
 * runs on mount, somebody who accepts on the landing page records nothing
 * until they navigate — and by then document.referrer is our own site, so
 * the one fact the beacon exists to capture is lost. Accepting has to fire
 * it for the visit they are already on.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CookieConsent from "@/components/providers/CookieConsent";
import VisitBeacon from "@/components/providers/VisitBeacon";

const bodyOf = (call: unknown[]): Record<string, unknown> =>
  JSON.parse((call[1] as RequestInit).body as string);

const Root = () => (
  <>
    <VisitBeacon />
    <CookieConsent />
  </>
);

describe("consent to beacon", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    fetchMock = jest.fn().mockResolvedValue({ status: 204 });
    global.fetch = fetchMock as unknown as typeof fetch;
    window.history.replaceState({}, "", "/?utm_source=linkedin&utm_medium=social");
    Object.defineProperty(document, "referrer", {
      value: "https://www.linkedin.com/feed/",
      configurable: true,
    });
  });

  it("sends nothing while the banner is still waiting for an answer", async () => {
    render(<Root />);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends nothing at all if the visitor declines", async () => {
    const user = userEvent.setup();
    render(<Root />);
    await user.click(await screen.findByRole("button", { name: "Only what is necessary" }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // The important one: no reload, no navigation, same page view.
  it("captures the current visit the moment the visitor accepts", async () => {
    const user = userEvent.setup();
    render(<Root />);
    await user.click(await screen.findByRole("button", { name: "Accept all" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("still has the original referrer and campaign when it fires", async () => {
    const user = userEvent.setup();
    render(<Root />);
    await user.click(await screen.findByRole("button", { name: "Accept all" }));
    expect(bodyOf(fetchMock.mock.calls[0])).toMatchObject({
      referrer: "https://www.linkedin.com/feed/",
      utm_source: "linkedin",
      utm_medium: "social",
      landing_path: "/",
    });
  });

  it("does not send twice when a consenting visitor loads another page", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Root />);
    await user.click(await screen.findByRole("button", { name: "Accept all" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    unmount();
    render(<Root />); // a second page view in the same session
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sends on the next load for someone who accepted previously", () => {
    localStorage.setItem("vc:analytics-consent", "granted");
    render(<Root />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps sending nothing on later loads for someone who declined", () => {
    localStorage.setItem("vc:analytics-consent", "denied");
    render(<Root />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // Declining then changing your mind in the same session must still work:
  // the refusal must not have consumed the once-per-session marker.
  it("works for a visitor who declines and then accepts", async () => {
    const user = userEvent.setup();
    render(<Root />);
    await user.click(await screen.findByRole("button", { name: "Only what is necessary" }));
    expect(fetchMock).not.toHaveBeenCalled();

    // Re-ask by clearing the record, as a preferences screen would.
    localStorage.clear();
    const { unmount } = render(<Root />);
    await user.click(await screen.findAllByRole("button", { name: "Accept all" }).then((b) => b[0]));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    unmount();
  });
});

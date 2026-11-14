/**
 * Tests for the bootstrap-password notice.
 *
 * This exists because of a real gap found by using the console: a freshly
 * seeded admin could sign in, reach the dashboard, navigate two pages deep
 * and get "You may not have access to this queue, or the request failed."
 * The real cause was PASSWORD_CHANGE_REQUIRED, which is specific and one
 * click away, and nothing in the UI said so.
 */

import { render, screen } from "@testing-library/react";
import AdminPasswordNotice from "@/components/pages/admin/AdminPasswordNotice";

let pathname = "/admin";
jest.mock("next/navigation", () => ({
  __esModule: true,
  usePathname: () => pathname,
}));

describe("AdminPasswordNotice", () => {
  beforeEach(() => {
    pathname = "/admin";
  });

  it("stays out of the way when nothing is wrong", () => {
    const { container } = render(<AdminPasswordNotice show={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  describe("when the account is on a bootstrap password", () => {
    it("names the real cause rather than leaving a generic failure", () => {
      render(<AdminPasswordNotice show />);
      expect(
        screen.getByText(/one-time bootstrap password/i),
      ).toBeInTheDocument();
    });

    // The whole point: connect the thing they will see to the reason.
    it("warns that other pages will report a failure", () => {
      render(<AdminPasswordNotice show />);
      expect(screen.getByText(/could not load/i)).toBeInTheDocument();
    });

    it("offers a way to fix it, not just a diagnosis", () => {
      render(<AdminPasswordNotice show />);
      expect(screen.getByRole("link", { name: /set a password/i })).toHaveAttribute(
        "href",
        "/admin/settings",
      );
    });

    it("announces itself to assistive technology", () => {
      render(<AdminPasswordNotice show />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    // Amber, not the brand red: this is an action the reader can take, not
    // a failure that has already happened.
    it("reads as a warning rather than an error", () => {
      render(<AdminPasswordNotice show />);
      expect(screen.getByRole("status").className).toMatch(/amber/);
    });
  });

  describe("on the settings page", () => {
    // The form it points at is already on screen there, and opened.
    it("hides itself rather than pointing at the page you are on", () => {
      pathname = "/admin/settings";
      const { container } = render(<AdminPasswordNotice show />);
      expect(container).toBeEmptyDOMElement();
    });

    it("hides on nested settings routes too", () => {
      pathname = "/admin/settings/security";
      const { container } = render(<AdminPasswordNotice show />);
      expect(container).toBeEmptyDOMElement();
    });

    it("still shows on every other admin page", () => {
      for (const p of ["/admin", "/admin/users", "/admin/telemetry", "/admin/team"]) {
        pathname = p;
        const { unmount } = render(<AdminPasswordNotice show />);
        expect(screen.getByRole("status")).toBeInTheDocument();
        unmount();
      }
    });
  });
});

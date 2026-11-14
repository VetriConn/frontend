/**
 * Tests for the consent banner.
 *
 * Two things carry most of the weight. It must not reappear for somebody
 * who already answered, or it becomes the thing people click away without
 * reading. And Accept and Decline must stay equally prominent — a quiet
 * decline beside a loud accept is the dark pattern regulators name first,
 * and consent collected that way is arguably not consent.
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CookieConsent from "@/components/providers/CookieConsent";
import { readConsent, analyticsAllowed } from "@/lib/consent";

describe("CookieConsent", () => {
  beforeEach(() => localStorage.clear());

  describe("when to appear", () => {
    it("asks a visitor who has not been asked", async () => {
      render(<CookieConsent />);
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });

    it("stays away from someone who already accepted", () => {
      localStorage.setItem("vc:analytics-consent", "granted");
      render(<CookieConsent />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("stays away from someone who already declined", () => {
      localStorage.setItem("vc:analytics-consent", "denied");
      render(<CookieConsent />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("asks again if the stored value is not a real answer", async () => {
      localStorage.setItem("vc:analytics-consent", "maybe");
      render(<CookieConsent />);
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("the two choices", () => {
    it("offers both", async () => {
      render(<CookieConsent />);
      const bar = await screen.findByRole("dialog");
      expect(within(bar).getByRole("button", { name: "Accept all" })).toBeInTheDocument();
      expect(within(bar).getByRole("button", { name: "Only what is necessary" })).toBeInTheDocument();
    });

    // Same classes means same size, weight and colour. If someone restyles
    // one to be louder than the other, this fails.
    it("gives them equal prominence", async () => {
      render(<CookieConsent />);
      const bar = await screen.findByRole("dialog");
      const accept = within(bar).getByRole("button", { name: "Accept all" });
      const decline = within(bar).getByRole("button", { name: "Only what is necessary" });
      expect(accept.className).toBe(decline.className);
    });

    // Keyboard order should not bury the refusal behind the acceptance.
    it("puts Decline first in the tab order", async () => {
      render(<CookieConsent />);
      const bar = await screen.findByRole("dialog");
      const names = within(bar)
        .getAllByRole("button")
        .map((b) => b.textContent)
        .filter((n) => n !== "What is stored");
      expect(names).toEqual(["Only what is necessary", "Accept all"]);
    });
  });

  describe("accepting", () => {
    it("records the grant", async () => {
      const user = userEvent.setup();
      render(<CookieConsent />);
      await user.click(await screen.findByRole("button", { name: "Accept all" }));
      expect(readConsent()).toBe("granted");
      expect(analyticsAllowed()).toBe(true);
    });

    it("dismisses the bar", async () => {
      const user = userEvent.setup();
      render(<CookieConsent />);
      await user.click(await screen.findByRole("button", { name: "Accept all" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("declining", () => {
    it("records the refusal, so it is not asked again", async () => {
      const user = userEvent.setup();
      render(<CookieConsent />);
      await user.click(await screen.findByRole("button", { name: "Only what is necessary" }));
      expect(readConsent()).toBe("denied");
    });

    // The whole point of the gate.
    it("leaves analytics off", async () => {
      const user = userEvent.setup();
      render(<CookieConsent />);
      await user.click(await screen.findByRole("button", { name: "Only what is necessary" }));
      expect(analyticsAllowed()).toBe(false);
    });

    it("dismisses the bar", async () => {
      const user = userEvent.setup();
      render(<CookieConsent />);
      await user.click(await screen.findByRole("button", { name: "Only what is necessary" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("what it says", () => {
    it("explains what is collected in plain words", async () => {
      render(<CookieConsent />);
      const bar = await screen.findByRole("dialog");
      expect(bar).toHaveTextContent(/which site you arrived from/i);
    });

    /*
     * The earlier copy said "Decline and the site works exactly the same",
     * and this test asserted it. Both were wrong in the same way: four
     * things persist whichever button is pressed, so a refusal path that
     * implies an empty set is a claim the product contradicts. The banner
     * now says so up front.
     */
    it("admits that some things are stored either way", async () => {
      render(<CookieConsent />);
      const bar = await screen.findByRole("dialog");
      expect(bar).toHaveTextContent(/stored either way/i);
    });

    it("does not claim that refusing stores nothing", async () => {
      render(<CookieConsent />);
      const bar = await screen.findByRole("dialog");
      expect(bar).not.toHaveTextContent(/works exactly the same/i);
    });

    it("is labelled for assistive technology", async () => {
      render(<CookieConsent />);
      const bar = await screen.findByRole("dialog");
      expect(bar).toHaveAttribute("aria-labelledby");
      const id = bar.getAttribute("aria-labelledby")!;
      expect(document.getElementById(id)).toBeInTheDocument();
    });

    // It must not trap focus or block the page — somebody should be able to
    // read the site and then decide.
    it("does not claim to be a modal", async () => {
      render(<CookieConsent />);
      const bar = await screen.findByRole("dialog");
      expect(bar).toHaveAttribute("aria-modal", "false");
    });
  });
});

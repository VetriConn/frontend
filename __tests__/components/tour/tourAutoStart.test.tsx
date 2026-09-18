/**
 * When the tour is allowed to start.
 *
 * The tour resolves its step list ONCE, at start, and drops any step whose
 * anchor is not in the DOM. That makes "when do we start" a correctness
 * question rather than a timing preference: start too early and the account
 * permanently loses a step for that run.
 *
 * The case that bit: the Companies nav entry only renders once the companies
 * request resolves, and that request is keyed on the profile, so it does not
 * even begin until the profile lands. Starting as soon as the profile landed
 * meant the Companies step was dropped for essentially every account that
 * had a company.
 */
import React from "react";
import { render, waitFor } from "@testing-library/react";
import TourAutoStart from "@/components/tour/TourAutoStart";

const start = jest.fn();

jest.mock("@/components/tour/TourProvider", () => ({
  useTour: () => ({ start, isRunning: false, stop: jest.fn() }),
}));

const profileState = { userProfile: null as unknown, isLoading: true };
const companiesState = { isLoading: true };

jest.mock("@/hooks/useUserProfile", () => ({
  useUserProfile: () => profileState,
}));
jest.mock("@/hooks/useCompanies", () => ({
  useMyCompanies: () => companiesState,
}));

beforeEach(() => {
  start.mockClear();
  profileState.userProfile = null;
  profileState.isLoading = true;
  companiesState.isLoading = true;
});

describe("TourAutoStart", () => {
  it("does not start while the profile is still loading", async () => {
    render(<TourAutoStart />);
    await new Promise((r) => setTimeout(r, 250));
    expect(start).not.toHaveBeenCalled();
  });

  it("does not start while companies are still loading", async () => {
    // The profile has landed but the nav cannot know yet whether to render a
    // Companies entry. Starting here is what dropped the step.
    profileState.userProfile = { tour_completed_at: null };
    profileState.isLoading = false;
    render(<TourAutoStart />);
    await new Promise((r) => setTimeout(r, 250));
    expect(start).not.toHaveBeenCalled();
  });

  it("starts once both have settled", async () => {
    profileState.userProfile = { tour_completed_at: null };
    profileState.isLoading = false;
    companiesState.isLoading = false;
    render(<TourAutoStart />);
    await waitFor(() => expect(start).toHaveBeenCalledWith("auto"));
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("never starts for an account that has already seen it", async () => {
    profileState.userProfile = { tour_completed_at: "2026-09-01T00:00:00Z" };
    profileState.isLoading = false;
    companiesState.isLoading = false;
    render(<TourAutoStart />);
    await new Promise((r) => setTimeout(r, 250));
    expect(start).not.toHaveBeenCalled();
  });

  it("starts at most once even if the profile revalidates", async () => {
    profileState.userProfile = { tour_completed_at: null };
    profileState.isLoading = false;
    companiesState.isLoading = false;
    const { rerender } = render(<TourAutoStart />);
    await waitFor(() => expect(start).toHaveBeenCalledTimes(1));
    rerender(<TourAutoStart />);
    rerender(<TourAutoStart />);
    await new Promise((r) => setTimeout(r, 150));
    // A revalidation landing before the completion write must not restart the
    // tour underneath someone already taking it.
    expect(start).toHaveBeenCalledTimes(1);
  });
});

/**
 * Tests for the dismissible profile nudge.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { CompleteProfileCard } from "@/components/ui/ProfileCompletionCards";

describe("CompleteProfileCard", () => {
  it("shows the title and progress", () => {
    render(<CompleteProfileCard completed={6} total={11} percentage={55} />);
    expect(screen.getByText("Complete your profile")).toBeInTheDocument();
    expect(screen.getByText(/6 of 11/)).toBeInTheDocument();
    expect(screen.getByText("55%")).toBeInTheDocument();
  });

  it("has no dismiss control unless onDismiss is given", () => {
    render(<CompleteProfileCard completed={6} total={11} percentage={55} />);
    expect(screen.queryByRole("button", { name: /dismiss/i })).toBeNull();
  });

  it("calls onDismiss when the dismiss control is clicked", () => {
    const onDismiss = jest.fn();
    render(
      <CompleteProfileCard
        completed={6}
        total={11}
        percentage={55}
        onDismiss={onDismiss}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
